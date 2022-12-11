
import { RakunContextManager } from "../context/interface";
import { ErrorConstructor } from "../types";
import { Void, VoidValue, WrappedValue_OPAQUE } from "../wrapped";
import { RakunCallback, RakunCallbackSource, RakunSourceBuild, RakunSource, ReturnUnzip, ReturnUnzipWhen } from "./interface";

export const fromAsyncIterator = <T>(execute: RakunCallbackSource<T>): RakunSourceBuild<T> => {
    return new RakunSourceBuildImpl<T>(execute)
}

export const resolveArray = <T>(array: T[] | T): T[] => {
    return Array.isArray(array) ? array : [array]
}

export const fromCallback = <T>(...callbacks: RakunCallback<T>[]): RakunSourceBuild<T> => {
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

export class RakunSourceBuildImpl<T> implements RakunSourceBuild<T> {
    constructor(private calback: RakunCallbackSource<T>) {
    }
    [WrappedValue_OPAQUE] = 'sourceBuild';

    switchIfEmpty(source: RakunSource<T>): RakunSourceBuild<T> {
        return fromAsyncIterator((ctx) => {
            let it = this.asyncIterator(ctx)
            let index = 0;
            return {
                [Symbol.asyncIterator]: () => {
                    let asyncIterator: AsyncIterator<T> = {
                        async next() {
                            let item = await it.next()
                            if (item.done && index == 0) {
                                it = source.asyncIterator(ctx)
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
    defaultIfEmpty(value: T): RakunSourceBuild<T> {
        return this.switchIfEmpty(fromCallback<T>(() => [value]))
    }
    zip<R extends RakunSource<any>[]>(...sources: R): RakunSourceBuild<[T, ...ReturnUnzip<R>]> {
        return fromAsyncIterator((ctx) => {
            let it = this.asyncIterator(ctx)
            return {
                [Symbol.asyncIterator]: () => {
                    let asyncIterator: AsyncIterator<[T, ...ReturnUnzip<R>]> = {
                        async next() {
                            let item: IteratorResult<T> = await it.next()
                            if (item.done) {
                                return item
                            }
                            let value = [item!.value, ...await Promise.all(sources.map(source => source.asyncIterator(ctx).next()))
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
    zipWhen<R extends ((value: T) => RakunSource<any>)[]>(...sourceFns: R): RakunSourceBuild<[T, ...ReturnUnzipWhen<R>]> {
        return fromAsyncIterator((ctx) => {
            let it = this.asyncIterator(ctx)
            return {
                [Symbol.asyncIterator]: () => {
                    let asyncIterator: AsyncIterator<[T, ...ReturnUnzipWhen<R>]> = {
                        async next() {
                            let item: IteratorResult<T> = await it.next()
                            if (item.done) {
                                return item
                            }
                            let value = [item!.value, ... await Promise.all(sourceFns.map(fn => fn(item!.value).asyncIterator(ctx).next()))
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
    flatFilter(fn: (value: T) => RakunSource<boolean>): RakunSourceBuild<T> {
        return fromAsyncIterator((ctx) => {
            let it = this.asyncIterator(ctx)
            return {
                [Symbol.asyncIterator]: () => {
                    let asyncIterator: AsyncIterator<T> = {
                        async next() {
                            const item = await it.next()
                            if (item.done) {
                                return item
                            }
                            let b = await (await fn(item.value).asyncIterator(ctx)).next()
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
    filter(fn: (value: T) => boolean): RakunSourceBuild<T> {
        return fromAsyncIterator((ctx) => {
            let it = this.asyncIterator(ctx)
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
    thenReturn<R>(value: R): RakunSourceBuild<R> {
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
    then<R>(source?: RakunSource<R>): RakunSourceBuild<R> | RakunSourceBuild<Void> {

        if (!source)
            return this.thenReturn(VoidValue)

        let sourceOld = this;
        return fromAsyncIterator((ctx) => {
            let finish = false
            let it2 = source.asyncIterator(ctx);
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
    onErrorResume<E>(errorType: ErrorConstructor<E>, fn: (value: E) => RakunSourceBuild<T>): RakunSourceBuild<T> {
        return fromAsyncIterator((ctx) => ({
            [Symbol.asyncIterator]: () => {
                let iterator = this.asyncIterator(ctx)
                let asyncIterator: AsyncIterator<T> = {
                    async next() {
                        try {
                            return await iterator.next()
                        } catch (error) {
                            if (error instanceof errorType) {
                                return await fn(error).asyncIterator(ctx).next();
                            }
                            throw error;
                        }

                    }
                };
                return asyncIterator;
            }
        }))
    }

    doOnNext(handler: (value: T) => any): RakunSourceBuild<T> {
        return fromAsyncIterator((ctx) => ({
            [Symbol.asyncIterator]: () => {
                let iterator = this.asyncIterator(ctx)
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

    doOnError(handler: (error: any) => any): RakunSourceBuild<T> {
        return fromAsyncIterator((ctx) => {
            let it = this.asyncIterator(ctx)
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



    pipe<R>(fn: (value: T) => R | Promise<R>): RakunSourceBuild<R> {
        return fromAsyncIterator((ctx) => ({
            [Symbol.asyncIterator]: () => {
                let it = this.asyncIterator(ctx)
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
    flatPipe<R>(fn: (value: T) => RakunSourceBuild<R>): RakunSourceBuild<R> {
        return fromAsyncIterator((ctx) => ({
            [Symbol.asyncIterator]: () => {
                let iterator = this.asyncIterator(ctx)
                let item: IteratorResult<T> | null = null// (1)
                let iterator2: AsyncIterator<R> | null = null// (1)
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
                            iterator2 = fn(item!.value).asyncIterator(ctx)
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
        for await (const i of await this.calback(contextManager)) arr.push(i);
        return arr;
    }
    asyncIterator(ctx: RakunContextManager): AsyncIterator<T> {
        return (this.calback(ctx))[Symbol.asyncIterator]()
    }
}