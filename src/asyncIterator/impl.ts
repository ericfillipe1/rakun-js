
import { RakunContextManager } from "../context/interface";
import { ErrorConstructor, RakunAsyncIteratorSource, RakunContextManagerCallback, RakunSource } from "../types";
import { Void, WrappedValue_OPAQUE } from "../wrapped";
import { RakunAsyncIterator, RakunStaticAsyncIterator, ReturnUnzip, ReturnUnzipWhen } from "./interface";

const fromAsyncIterator = <T>(execute: RakunContextManagerCallback<AsyncIterable<T>>): RakunAsyncIterator<T> => {
    return new RakunAsyncIteratorImpl<T>(execute)
}
const just = <T>(...promises: Promise<T>[] | T[]): RakunAsyncIterator<T> => {
    return fromCallback<T>(() => promises)
}
const fromArray = <R>(values: R[] | Promise<R[]>): RakunAsyncIterator<R> => {
    return fromCallback(() => values);
}
const then = (): RakunAsyncIterator<typeof Void> => {
    return fromCallback<typeof Void>(() => [Void])
}
const empty = <T>(): RakunAsyncIterator<T> => {
    return fromCallback(() => [])
}
const zip = <R extends RakunSource<any>[]>(...sources: R): RakunAsyncIterator<[...ReturnUnzip<R>]> => {
    return fromAsyncIterator((ctx) => {
        let finish = false
        return {
            [Symbol.asyncIterator]: () => {
                let asyncIterator: AsyncIterator<[...ReturnUnzip<R>]> = {
                    async next() {
                        if (!finish) {
                            finish = true;
                            let value = await Promise.all(sources.map(source => source.iterator(ctx).next()))
                                .then(array => array.map(item => item.done ? null : item.value));
                            return {
                                done: false,
                                value: value as [...ReturnUnzip<R>]
                            }
                        }
                        return {
                            done: true,
                            value: null
                        }
                    }
                };
                return asyncIterator;
            }
        }
    })
}
const error = <T>(error: any): RakunAsyncIterator<T> => {
    return fromCallback<T>(async () => {
        throw error
    })
}

const fromCallback = <T>(...callbacks: RakunContextManagerCallback<Promise<T>[] | T[] | Promise<T[]>>[]): RakunAsyncIterator<T> => {
    return fromAsyncIterator((ctx) => {
        let values: T[] | null = null
        return {
            [Symbol.asyncIterator]: () => {
                let asyncIterator: AsyncIterator<T> = {
                    async next() {
                        if (!values) {
                            values = await Promise.resolve(callbacks.map(callback => Promise.resolve(callback(ctx))))
                                .then(a => Promise.all(a))
                                .then(a => Promise.all(a.flat().map(e => Promise.resolve(e))))
                        }
                        if (!values || values.length == 0) {
                            return {
                                done: true,
                                value: null
                            }
                        }
                        const [value, ...rest] = values
                        values = rest
                        return {
                            done: false,
                            value: value
                        }
                    }
                };
                return asyncIterator;
            }
        }
    })
}

export class RakunAsyncIteratorImpl<T> implements RakunAsyncIterator<T> {
    constructor(private callback: RakunContextManagerCallback<AsyncIterable<T>>) {
    }
    [WrappedValue_OPAQUE]: "asyncIterator" = 'asyncIterator';;

    switchIfEmpty(source: RakunAsyncIterator<T>): RakunAsyncIterator<T> {
        return fromAsyncIterator((ctx) => {
            let it: AsyncIterator<T> | Iterator<T> = this.iterator(ctx)
            let index = 0;
            return {
                [Symbol.asyncIterator]: () => {
                    let asyncIterator: AsyncIterator<T> = {
                        async next() {
                            let item = await it.next()
                            if (item.done && index == 0) {
                                it = source.iterator(ctx)
                                item = await it.next()
                            }
                            index++;
                            return item
                        }
                    };
                    return asyncIterator;
                }
            }
        })
    }
    defaultIfEmpty(value: T): RakunAsyncIterator<T> {
        return this.switchIfEmpty(fromCallback<T>(() => [value]))
    }
    zip<R extends RakunAsyncIteratorSource<any>[]>(...sources: R): RakunAsyncIterator<[T, ...ReturnUnzip<R>]> {
        return fromAsyncIterator((ctx) => {
            let it = this.iterator(ctx)
            return {
                [Symbol.asyncIterator]: () => {
                    let asyncIterator: AsyncIterator<[T, ...ReturnUnzip<R>]> = {
                        async next() {
                            let item: IteratorResult<T> = await it.next()
                            if (item.done) {
                                return item
                            }
                            let value = [item!.value, ...await Promise.all(sources.map(source => source.iterator(ctx).next()))
                                .then(array => array.map(item => item.done ? null : item.value))];
                            return {
                                done: item!.done,
                                value: value as [T, ...ReturnUnzip<R>]
                            }
                        }
                    };
                    return asyncIterator;
                }
            }
        })
    }
    zipWhen<R extends ((value: T) => RakunAsyncIteratorSource<any>)[]>(...sourceFns: R): RakunAsyncIterator<[T, ...ReturnUnzipWhen<R>]> {
        return fromAsyncIterator((ctx) => {
            let it = this.iterator(ctx)
            return {
                [Symbol.asyncIterator]: () => {
                    let asyncIterator: AsyncIterator<[T, ...ReturnUnzipWhen<R>]> = {
                        async next() {
                            let item: IteratorResult<T> = await it.next()
                            if (item.done) {
                                return item
                            }
                            let value = [item!.value, ... await Promise.all(sourceFns.map(fn => fn(item!.value).iterator(ctx).next()))
                                .then(array => array.map(item => item.done ? null : item.value))];
                            return {
                                done: item!.done,
                                value: value as [T, ...ReturnUnzipWhen<R>]
                            }
                        }
                    };
                    return asyncIterator;
                }
            }
        })
    }
    flatFilter(fn: (value: T) => RakunAsyncIterator<boolean>): RakunAsyncIterator<T> {
        return fromAsyncIterator((ctx) => {
            let it = this.iterator(ctx)
            return {
                [Symbol.asyncIterator]: () => {
                    let asyncIterator: AsyncIterator<T> = {
                        async next() {
                            const item = await it.next()
                            if (item.done) {
                                return item
                            }
                            let b = await (await fn(item.value).iterator(ctx)).next()
                            if (!(b).value) {
                                return await asyncIterator.next();
                            }
                            return item;
                        }
                    };
                    return asyncIterator;
                }
            }
        })
    }
    filter(fn: (value: T) => boolean): RakunAsyncIterator<T> {
        return fromAsyncIterator((ctx) => {
            let it = this.iterator(ctx)
            return {
                [Symbol.asyncIterator]: () => {
                    let asyncIterator: AsyncIterator<T> = {
                        async next() {
                            const item = await it.next()
                            if (item.done) {
                                return item
                            }
                            let b = fn(item.value)
                            if (!(b)) {
                                return await asyncIterator.next();
                            }
                            return item;
                        }
                    };
                    return asyncIterator;
                }
            }
        })
    }
    thenReturn<R>(value: R): RakunAsyncIterator<R> {
        let sourceOld = this;
        return fromAsyncIterator((ctx) => {
            let finish = false
            return {
                [Symbol.asyncIterator]: () => {
                    let asyncIterator: AsyncIterator<R> = {
                        async next() {
                            if (!finish) {
                                finish = true;
                                await sourceOld.block(ctx);
                                return {
                                    value
                                }
                            }
                            return {
                                done: true,
                                value: null
                            }
                        }
                    };
                    return asyncIterator;
                }
            }
        })
    }
    then<R>(source?: RakunAsyncIteratorSource<R>): RakunAsyncIterator<R> | RakunAsyncIterator<typeof Void> {

        if (!source)
            return this.thenReturn(Void)

        let sourceOld = this;
        return fromAsyncIterator((ctx) => {
            let finish = false
            let it2 = source.iterator(ctx);
            return {
                [Symbol.asyncIterator]: () => {
                    let asyncIterator: AsyncIterator<R> = {
                        async next() {
                            if (!finish) {
                                finish = true;
                                await sourceOld.block(ctx);
                            }
                            let item2 = await it2.next()
                            if (item2.done) {
                                return item2
                            }
                            return item2
                        }
                    };
                    return asyncIterator;
                }
            }
        })
    }
    onErrorResume<E>(errorType: ErrorConstructor<E>, fn: (value: E) => RakunAsyncIterator<T>): RakunAsyncIterator<T> {
        return fromAsyncIterator((ctx) => ({
            [Symbol.asyncIterator]: () => {
                let iterator = this.iterator(ctx)
                let asyncIterator: AsyncIterator<T> = {
                    async next() {
                        try {
                            return await iterator.next()
                        } catch (error) {
                            if (error instanceof errorType) {
                                return await fn(error).iterator(ctx).next();
                            }
                            throw error;
                        }

                    }
                };
                return asyncIterator;
            }
        }))
    }

    doOnNext(handler: (value: T) => any): RakunAsyncIterator<T> {
        return fromAsyncIterator((ctx) => ({
            [Symbol.asyncIterator]: () => {
                let iterator = this.iterator(ctx)
                let asyncIterator: AsyncIterator<T> = {
                    async next() {
                        const item = await iterator.next()
                        if (!item.done) {
                            handler(item.value)
                        }
                        return item
                    }
                };
                return asyncIterator;
            }
        }))
    }

    doOnError(handler: (error: any) => any): RakunAsyncIterator<T> {
        return fromAsyncIterator((ctx) => {
            let it = this.iterator(ctx)
            return {
                [Symbol.asyncIterator]: () => {
                    let asyncIterator: AsyncIterator<T> = {
                        async next() {
                            try {
                                return await it.next();
                            } catch (error) {
                                handler(error)
                                throw error;
                            }
                        }
                    };
                    return asyncIterator;
                }
            }
        })
    }



    pipe<R>(fn: (value: T) => R | Promise<R>): RakunAsyncIterator<R> {
        return fromAsyncIterator((ctx) => ({
            [Symbol.asyncIterator]: () => {
                let it = this.iterator(ctx)
                let asyncIterator: AsyncIterator<R> = {
                    async next() {
                        const item = await it.next()
                        if (item.done) {
                            return item
                        }
                        return {
                            done: item.done,
                            value: await fn(item.value)
                        };
                    }
                };
                return asyncIterator;
            }
        }))
    }
    flatPipe<R>(fn: (value: T) => RakunAsyncIterator<R>): RakunAsyncIterator<R> {
        return fromAsyncIterator((ctx) => ({
            [Symbol.asyncIterator]: () => {
                let iterator = this.iterator(ctx)
                let item: IteratorResult<T> | null = null// (1)
                let iterator2: AsyncIterator<R> | Iterator<R> | null = null// (1)
                let asyncIterator: AsyncIterator<R> = {
                    async next() {
                        if (item == null) {
                            item = await iterator.next()
                        }
                        if (item!.done) {
                            return {
                                done: true,
                                value: item!.value
                            }
                        }
                        if (iterator2 == null) {
                            iterator2 = fn(item!.value).iterator(ctx)
                        }
                        let item2 = await iterator2!.next()
                        if (item2.done) {
                            iterator2 = null;
                            item = null;
                            return await asyncIterator.next()
                        } else {
                            return {
                                done: item2.done,
                                value: item2.value
                            };
                        }
                    }
                };
                return asyncIterator;
            }
        }))
    }

    async blockFirst(contextManager: RakunContextManager): Promise<T> {
        const array = await this.block(contextManager);
        return array[0];
    }

    async block(contextManager: RakunContextManager): Promise<T[]> {
        const arr: any[] = [];
        for await (const i of await this.callback(contextManager)) arr.push(i);
        return arr;
    }
    iterator(ctx: RakunContextManager): AsyncIterator<T> {
        return (this.callback(ctx))[Symbol.asyncIterator]()
    }
}



export class StaticAsyncIteratorImpl implements RakunStaticAsyncIterator {
    then = then
    empty = empty
    zip = zip
    just = just
    error = error
    fromArray = fromArray
    fromCallback = fromCallback
}
