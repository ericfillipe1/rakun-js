
import { RakunCallback } from "../asyncIterator";
import { RakunContextManager } from "../context/interface";
import { ErrorConstructor } from "../types";
import { Void, WrappedValue_OPAQUE } from "../wrapped";
import { RakunIterator, RakunStaticIterator, ReturnUnzip, ReturnUnzipWhen } from "./interface";

const fromIterator = <T>(execute: RakunCallback<Iterable<T>>): RakunIterator<T> => {
    return new RakunIteratorImpl<T>(execute)
}

const just = <T>(...promises: T[]): RakunIterator<T> => {
    return fromCallback<T>(() => promises)
}
const fromArray = <R>(values: R[]): RakunIterator<R> => {
    return fromCallback(() => values);
}
const then = (): RakunIterator<typeof Void> => {
    return fromCallback<typeof Void>(() => [Void])
}
const empty = <T>(): RakunIterator<T> => {
    return fromCallback(() => [])
}
const zip = <R extends RakunIterator<any>[]>(...sources: R): RakunIterator<[...ReturnUnzip<R>]> => {
    return fromIterator((ctx) => {
        let finish = false
        return {
            [Symbol.iterator]: () => {
                let iterator: Iterator<[...ReturnUnzip<R>]> = {
                    next() {
                        if (!finish) {
                            finish = true;
                            let value = sources.map(source => source.iterator(ctx).next())
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
    })
}
const error = <T>(error: any): RakunIterator<T> => {
    return fromCallback<T>(() => {
        throw error
    })
}


const fromCallback = <T>(...callbacks: RakunCallback<T[]>[]): RakunIterator<T> => {
    return fromIterator((ctx) => {
        let values: T[] | null = null
        return {
            [Symbol.iterator]: () => {
                let iterator0: Iterator<T> = {
                    next() {
                        if (!values) {
                            values = (callbacks.map(callback => (callback(ctx))))
                                .flat()
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
                return iterator0;
            }
        }
    })
}

export class RakunIteratorImpl<T> implements RakunIterator<T> {
    constructor(private callback: RakunCallback<Iterable<T>>) {
    }
    [WrappedValue_OPAQUE]: 'iterator' = 'iterator'
    switchIfEmpty(source: RakunIterator<T>): RakunIterator<T> {
        return fromIterator((ctx) => {
            let it = this.iterator(ctx)
            let index = 0;
            return {
                [Symbol.iterator]: () => {
                    let iterator0: Iterator<T> = {
                        next() {
                            let item = it.next()
                            if (item.done && index == 0) {
                                it = source.iterator(ctx)
                                item = it.next()
                            }
                            index++;
                            return item
                        }
                    };
                    return iterator0;
                }
            }
        })
    }
    defaultIfEmpty(value: T): RakunIterator<T> {
        return this.switchIfEmpty(fromCallback<T>(() => [value]))
    }
    zip<R extends RakunIterator<any>[]>(...sources: R): RakunIterator<[T, ...ReturnUnzip<R>]> {
        return fromIterator((ctx) => {
            let it = this.iterator(ctx)
            return {
                [Symbol.iterator]: () => {
                    let iterator0: Iterator<[T, ...ReturnUnzip<R>]> = {
                        next() {
                            let item: IteratorResult<T> = it.next()
                            if (item.done) {
                                return item
                            }
                            let value = [item!.value, ... (sources.map(source => source.iterator(ctx).next()))
                                .map(item => item.done ? null : item.value)];
                            return {
                                done: item!.done,
                                value: value as [T, ...ReturnUnzip<R>]
                            }
                        }
                    };
                    return iterator0;
                }
            }
        })
    }
    zipWhen<R extends ((value: T) => RakunIterator<any>)[]>(...sourceFns: R): RakunIterator<[T, ...ReturnUnzipWhen<R>]> {
        return fromIterator((ctx) => {
            let it = this.iterator(ctx)
            return {
                [Symbol.iterator]: () => {
                    let iterator0: Iterator<[T, ...ReturnUnzipWhen<R>]> = {
                        next() {
                            let item: IteratorResult<T> = it.next()
                            if (item.done) {
                                return item
                            }
                            let value = [item!.value, ...  (sourceFns.map(fn => fn(item!.value).iterator(ctx).next()))
                                .map(item => item.done ? null : item.value)];
                            return {
                                done: item!.done,
                                value: value as [T, ...ReturnUnzipWhen<R>]
                            }
                        }
                    };
                    return iterator0;
                }
            }
        })
    }
    flatFilter(fn: (value: T) => RakunIterator<boolean>): RakunIterator<T> {
        return fromIterator((ctx) => {
            let it = this.iterator(ctx)
            return {
                [Symbol.iterator]: () => {
                    let iterator0: Iterator<T> = {
                        next() {
                            const item = it.next()
                            if (item.done) {
                                return item
                            }
                            let b = (fn(item.value).iterator(ctx)).next()
                            if (!(b).value) {
                                return iterator0.next();
                            }
                            return item;
                        }
                    };
                    return iterator0;
                }
            }
        })
    }
    filter(fn: (value: T) => boolean): RakunIterator<T> {
        return fromIterator((ctx) => {
            let it = this.iterator(ctx)
            return {
                [Symbol.iterator]: () => {
                    let iterator0: Iterator<T> = {
                        next() {
                            const item = it.next()
                            if (item.done) {
                                return item
                            }
                            let b = fn(item.value)
                            if (!(b)) {
                                return iterator0.next();
                            }
                            return item;
                        }
                    };
                    return iterator0;
                }
            }
        })
    }
    thenReturn<R>(value: R): RakunIterator<R> {
        let sourceOld = this;
        return fromIterator((ctx) => {
            let finish = false
            return {
                [Symbol.iterator]: () => {
                    let iterator0: Iterator<R> = {
                        next() {
                            if (!finish) {
                                finish = true;
                                sourceOld.block(ctx);
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
                    return iterator0;
                }
            }
        })
    }
    then<R>(source?: RakunIterator<R>): RakunIterator<R> | RakunIterator<typeof Void> {

        if (!source)
            return this.thenReturn(Void)

        let sourceOld = this;
        return fromIterator((ctx) => {
            let finish = false
            let it2 = source.iterator(ctx);
            return {
                [Symbol.iterator]: () => {
                    let iterator0: Iterator<R> = {
                        next() {
                            if (!finish) {
                                finish = true;
                                sourceOld.block(ctx);
                            }
                            let item2 = it2.next()
                            if (item2.done) {
                                return item2
                            }
                            return item2
                        }
                    };
                    return iterator0;
                }
            }
        })
    }
    onErrorResume<E>(errorType: ErrorConstructor<E>, fn: (value: E) => RakunIterator<T>): RakunIterator<T> {
        return fromIterator((ctx) => ({
            [Symbol.iterator]: () => {
                let iterator = this.iterator(ctx)
                let iterator0: Iterator<T> = {
                    next() {
                        try {
                            return iterator.next()
                        } catch (error) {
                            if (error instanceof errorType) {
                                return fn(error).iterator(ctx).next();
                            }
                            throw error;
                        }

                    }
                };
                return iterator0;
            }
        }))
    }

    doOnNext(handler: (value: T) => any): RakunIterator<T> {
        return fromIterator((ctx) => ({
            [Symbol.iterator]: () => {
                let iterator = this.iterator(ctx)
                let iterator0: Iterator<T> = {
                    next() {
                        const item = iterator.next()
                        if (!item.done) {
                            handler(item.value)
                        }
                        return item
                    }
                };
                return iterator0;
            }
        }))
    }

    doOnError(handler: (error: any) => any): RakunIterator<T> {
        return fromIterator((ctx) => {
            let it = this.iterator(ctx)
            return {
                [Symbol.iterator]: () => {
                    let iterator0: Iterator<T> = {
                        next() {
                            try {
                                return it.next();
                            } catch (error) {
                                handler(error)
                                throw error;
                            }
                        }
                    };
                    return iterator0;
                }
            }
        })
    }



    pipe<R>(fn: (value: T) => R): RakunIterator<R> {
        return fromIterator((ctx) => ({
            [Symbol.iterator]: () => {
                let it = this.iterator(ctx)
                let iterator0: Iterator<R> = {
                    next() {
                        const item = it.next()
                        if (item.done) {
                            return item
                        }
                        return {
                            done: item.done,
                            value: fn(item.value)
                        };
                    }
                };
                return iterator0;
            }
        }))
    }
    flatPipe<R>(fn: (value: T) => RakunIterator<R>): RakunIterator<R> {
        return fromIterator((ctx) => ({
            [Symbol.iterator]: () => {
                let iterator = this.iterator(ctx)
                let item: IteratorResult<T> | null = null// (1)
                let iterator2: Iterator<R> | null = null// (1)
                let iterator0: Iterator<R> = {
                    next() {
                        if (item == null) {
                            item = iterator.next()
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
                        let item2 = iterator2!.next()
                        if (item2.done) {
                            iterator2 = null;
                            item = null;
                            return iterator0.next()
                        } else {
                            return {
                                done: item2.done,
                                value: item2.value
                            };
                        }
                    }
                };
                return iterator0;
            }
        }))
    }
    blockFirst(contextManager: RakunContextManager): T {
        const array = this.block(contextManager);
        return array[0];
    }
    block(contextManager: RakunContextManager): T[] {
        const arr: any[] = [];
        for (const i of this.callback(contextManager)) arr.push(i);
        return arr;
    }
    iterator(ctx: RakunContextManager): Iterator<T> {
        return (this.callback(ctx))[Symbol.iterator]()
    }
}



export class StaticIteratorImpl implements RakunStaticIterator {
    then = then
    empty = empty
    zip = zip
    just = just
    error = error
    fromArray = fromArray
    fromCallback = fromCallback

}