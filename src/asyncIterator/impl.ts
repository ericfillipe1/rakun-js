
import { RakunContextManager } from "../context/interface";
import { ErrorConstructor, RakunContextManagerCallback, RakunExec, RakunSource } from "../types";
import { Void, WrappedValue_OPAQUE } from "../wrapped";
import { RakunAsyncIterator, RakunStaticAsyncIterator, ReturnUnzip, ReturnUnzipWhen } from "./interface";


const isIterable = <T>(value: Iterable<T> | AsyncIterable<T>): value is Iterable<T> => Symbol.iterator in value

const isIterableResults = <T>(values: (Iterable<T> | AsyncIterable<T>)[]): values is Iterable<T>[] => (values.filter(v => isIterable(v)).length == values.length)

const fromExecute = <T>(execute: RakunExec<T>): RakunAsyncIterator<T> => {
    return new RakunAsyncIteratorImpl<T>(execute)
}
const just = <T>(...values: []): RakunAsyncIterator<T> => {
    return fromExecute<T>(() => values)
}
const then = (): RakunAsyncIterator<typeof Void> => {
    return fromExecute<typeof Void>(() => [Void])
}
const empty = <T>(): RakunAsyncIterator<T> => {
    return fromExecute(() => [])
}
const fromPromiseCallback = <T>(callback: RakunContextManagerCallback<Promise<T>[]>): RakunAsyncIterator<T> => {
    return fromExecute<T>((ctx) => {
        let it = callback(ctx)[Symbol.iterator]()
        return {
            [Symbol.asyncIterator]: () => {
                let asyncIterator: AsyncIterator<T> = {
                    async next() {
                        let item = it.next()
                        if (item.done) {
                            return item
                        }
                        return {
                            done: false,
                            value: await item.value
                        }
                    }
                };
                return asyncIterator;
            }
        }
    });
}



const zip = <R extends RakunSource<any>[]>(...sources: R): RakunAsyncIterator<[...ReturnUnzip<R>]> => {
    return fromExecute((ctx) => {
        let finish = false
        const iterables = sources.map(source => source.exec(ctx))
        if (isIterableResults(iterables))
            return {
                [Symbol.iterator]: () => {
                    let iterator: Iterator<[...ReturnUnzip<R>]> = {
                        next() {
                            if (!finish) {
                                finish = true;
                                let value = iterables.map(iterable => iterable[Symbol.iterator]().next())
                                    .map(item => item.done ? null : item.value);
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
                    return iterator;
                }
            }
        else
            return {
                [Symbol.asyncIterator]: () => {
                    let asyncIterator: AsyncIterator<[...ReturnUnzip<R>]> = {
                        async next() {
                            if (!finish) {
                                finish = true;
                                let value = await Promise.all(iterables.map(iterable => Symbol.iterator in iterable ? iterable[Symbol.iterator]().next() : iterable[Symbol.asyncIterator]().next()))
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
    return fromExecute<T>(() => {
        return {
            [Symbol.iterator]: () => {
                let finish = false
                let iterator: Iterator<T> = {
                    next() {
                        if (!finish) {
                            finish = true;
                            throw error
                        }
                        return {
                            done: true,
                            value: null
                        }
                    }
                };
                return iterator;
            }
        }
    })
}


export class RakunAsyncIteratorImpl<T> implements RakunAsyncIterator<T> {
    constructor(public exec: RakunExec<T>) {
    }
    array(): RakunAsyncIterator<T[]> {
        return fromExecute((ctx) => {

            const _iterable = this.exec(ctx)
            if (isIterable(_iterable)) {

                return [Array.from(_iterable)]
            } else {
                return {
                    [Symbol.asyncIterator]: () => {
                        let promise = new Promise<T[]>(async () => {
                            const arr: Awaited<T>[] = [];
                            for await (const i of await _iterable) arr.push(i);
                            return arr;
                        })
                        let finish = false
                        let asyncIterator: AsyncIterator<T[]> = {
                            async next() {
                                if (!finish) {
                                    finish = true;
                                    return {
                                        value: await promise
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
            }
        })
    }
    blockFirst(contextManager: RakunContextManager): T | Promise<T> {
        const _iterable = this.exec(contextManager)
        if (Symbol.iterator in _iterable) {
            return _iterable[Symbol.iterator]().next()?.value
        } else {
            return _iterable[Symbol.asyncIterator]().next()
                .then(result => result?.value)
        }
    }
    block(contextManager: RakunContextManager): T[] | Promise<T[]> {
        const _iterable = this.exec(contextManager)
        if (Symbol.iterator in _iterable) {
            return Array.from(_iterable)
        } else {
            return (async () => {
                const arr: T[] = [];
                for await (const i of _iterable) {
                    arr.push(i);
                }
                return arr;
            })()
        }
    }

    [WrappedValue_OPAQUE]: "asyncIterator" = 'asyncIterator';;

    switchIfEmpty(source: RakunSource<T>): RakunAsyncIterator<T> {
        return fromExecute((ctx) => {
            const _iterable = this.exec(ctx)
            let it: AsyncIterator<T> | Iterator<T> = Symbol.iterator in _iterable ? _iterable[Symbol.iterator]() : _iterable[Symbol.asyncIterator]()
            let index = 0;
            const iterable = source.exec(ctx)
            return {
                [Symbol.asyncIterator]: () => {
                    let asyncIterator: AsyncIterator<T> = {
                        async next() {
                            let item = await it.next()
                            if (item.done && index == 0) {
                                it = Symbol.iterator in iterable ? iterable[Symbol.iterator]() : iterable[Symbol.asyncIterator]()
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
        return this.switchIfEmpty(fromExecute<T>(() => [value]))
    }
    zip<R extends RakunSource<any>[]>(...sources: R): RakunAsyncIterator<[T, ...ReturnUnzip<R>]> {
        return this.flatPipe(v => {
            return zip(...sources).pipe((values) => [v as T, ...values as ReturnUnzip<R>] as [T, ...ReturnUnzip<R>])
        })
    }
    zipWhen<R extends ((value: T) => RakunSource<any>)[]>(...sourceFns: R): RakunAsyncIterator<[T, ...ReturnUnzipWhen<R>]> {
        return this.flatPipe(v => {
            return zip(...sourceFns.map(fn => fn(v))).pipe((values) => [v as T, ...values as ReturnUnzipWhen<R>] as [T, ...ReturnUnzipWhen<R>])
        })
    }
    flatFilter(fn: (value: T) => RakunSource<boolean>): RakunAsyncIterator<T> {
        return fromExecute((ctx) => {
            const _iterable = this.exec(ctx)
            let it: AsyncIterator<T> | Iterator<T> = Symbol.iterator in _iterable ? _iterable[Symbol.iterator]() : _iterable[Symbol.asyncIterator]()
            return {
                [Symbol.asyncIterator]: () => {
                    let asyncIterator: AsyncIterator<T> = {
                        async next() {
                            const item = await it.next()
                            if (item.done) {
                                return item
                            }
                            const iterable = fn(item.value).exec(ctx)
                            const itB = Symbol.iterator in iterable ? iterable[Symbol.iterator]() : iterable[Symbol.asyncIterator]()
                            let b = await (await itB).next()
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
        return fromExecute((ctx) => {
            const _iterable = this.exec(ctx)
            let it: AsyncIterator<T> | Iterator<T> = Symbol.iterator in _iterable ? _iterable[Symbol.iterator]() : _iterable[Symbol.asyncIterator]()
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
        return fromExecute((ctx) => {
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
    then<R>(source?: RakunSource<R>): RakunAsyncIterator<R> | RakunAsyncIterator<typeof Void> {
        if (!source)
            return this.thenReturn(Void)
        let sourceOld = this;
        return fromExecute((ctx) => {
            let finish = false
            const iterable = source.exec(ctx)
            return {
                [Symbol.asyncIterator]: () => {
                    let it2 = Symbol.iterator in iterable ? iterable[Symbol.iterator]() : iterable[Symbol.asyncIterator]();
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
    onErrorResume<E>(errorType: ErrorConstructor<E>, fn: (value: E) => RakunSource<T>): RakunAsyncIterator<T> {
        return fromExecute((ctx) => ({
            [Symbol.asyncIterator]: () => {
                const _iterable = this.exec(ctx)
                let iterator: AsyncIterator<T> | Iterator<T> = Symbol.iterator in _iterable ? _iterable[Symbol.iterator]() : _iterable[Symbol.asyncIterator]()
                let asyncIterator: AsyncIterator<T> = {
                    async next() {
                        try {
                            const r = await iterator.next()

                            return r;
                        } catch (error) {
                            if (error instanceof errorType) {
                                const iterableE = fn(error).exec(ctx)
                                let itE = Symbol.iterator in iterableE ? iterableE[Symbol.iterator]() : iterableE[Symbol.asyncIterator]();
                                let d = await itE.next();
                                return d
                            } else {

                                throw error;
                            }
                        }

                    }
                };
                return asyncIterator;
            }
        }))
    }

    doOnNext(handler: (value: T) => any): RakunAsyncIterator<T> {
        return fromExecute((ctx) => ({
            [Symbol.asyncIterator]: () => {
                const _iterable = this.exec(ctx)
                let iterator: AsyncIterator<T> | Iterator<T> = Symbol.iterator in _iterable ? _iterable[Symbol.iterator]() : _iterable[Symbol.asyncIterator]()
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
        return fromExecute((ctx) => {
            const _iterable = this.exec(ctx)
            let it: AsyncIterator<T> | Iterator<T> = Symbol.iterator in _iterable ? _iterable[Symbol.iterator]() : _iterable[Symbol.asyncIterator]()
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
        return fromExecute((ctx) => ({
            [Symbol.asyncIterator]: () => {
                const _iterable = this.exec(ctx)
                let it: AsyncIterator<T> | Iterator<T> = Symbol.iterator in _iterable ? _iterable[Symbol.iterator]() : _iterable[Symbol.asyncIterator]()
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
        return fromExecute((ctx) => ({
            [Symbol.asyncIterator]: () => {
                let _iterable = this.exec(ctx)
                let iterator = Symbol.iterator in _iterable ? _iterable[Symbol.iterator]() : _iterable[Symbol.asyncIterator]()
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
                            let _iterable2 = fn(item!.value).exec(ctx)
                            iterator2 = Symbol.iterator in _iterable2 ? _iterable2[Symbol.iterator]() : _iterable2[Symbol.asyncIterator]()
                        }
                        try {
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
                        } catch (error) {
                            iterator2 = null;
                            item = null;
                            throw error

                        }
                    }
                };
                return asyncIterator;
            }
        }))
    }



}



export class StaticAsyncIteratorImpl implements RakunStaticAsyncIterator {
    fromPromiseCallback = fromPromiseCallback
    then = then
    empty = empty
    zip = zip
    just = just
    error = error
    fromExecute = fromExecute
}
