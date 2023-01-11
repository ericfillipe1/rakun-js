import { RakunContextManager } from "../context";
import { ErrorConstructor, RakunIteratorSource, RakunNext, RakunNextResult, RakunNextResultDone, RakunNextResultValues, ReturnUnzip, ReturnUnzipWhen } from "../types";
import { Void } from "../wrapped";
import { RakunIterator, RakunStaticIterator } from "./interface";

const isPromise = <T>(value: Promise<T> | T): value is Promise<T> => value instanceof Promise

const isNotPromise = <T>(value: Promise<T> | T): value is T => !isPromise(value)


const just = <T>(...values: T[]): RakunIterator<T> => {
    let finish = false
    return getIteratorFromNext<T>(() => {
        if (!finish) {
            finish = true;
            return {
                type: 'values',
                values: values
            }
        }
        return {
            type: 'done',
        }
    });
}
const then = (): RakunIterator<typeof Void> => {
    return just(Void)
}
const empty = <T>(): RakunIterator<T> => {
    return getIteratorFromNext<T>(() => {
        return {
            type: 'done'
        }
    });
}
const fromPromise = <T>(...promises: (Promise<T> | Promise<T[]>)[]): RakunIterator<T> => {
    let finish = false
    return getIteratorFromNext<T>(() => {
        if (!finish) {
            finish = true;
            const promise = Promise.all(promises.map(p => p.then(p1 => Array.isArray(p1) ? p1 : [p1])))
                .then(array => array.flat())
            return {
                type: 'promise',
                promise: promise
            }
        }
        return {
            type: 'done',
        }
    });
}
const error = <T>(error: any): RakunIterator<T> => {
    let finish = false
    return getIteratorFromNext<T>(() => {
        if (!finish) {
            finish = true;
            throw error
        }
        return {
            type: 'done'
        }
    });
}
const zip = <R extends (RakunIteratorSource<any>)[]>(iterators: R): RakunIterator<[...ReturnUnzip<R>]> => {
    let finish = false
    return getIteratorFromNext<[...ReturnUnzip<R>]>((ctx) => {
        if (!finish) {
            finish = true;
            let results = iterators.map(iterator => iterator.iterator.next(ctx))
            let valueResults = results.filter(e => e.type != 'promise') as (RakunNextResultValues<[...ReturnUnzip<R>]> | RakunNextResultDone)[]
            if (valueResults.length == results.length) {
                var values = valueResults.map(result => {
                    if (result.type == 'values') {
                        return Promise.resolve(result.values[0])
                    } else {
                        return (null as any)
                    }
                })
                return {
                    type: 'values',
                    values: [values as [...ReturnUnzip<R>]]
                }
            } else {
                var promise = Promise.all(results.map(result => {
                    if (result.type == 'values') {
                        return Promise.resolve(result.values[0])
                    } else if (result.type == 'promise') {
                        return result.promise.then(value => value[0])
                    } else {
                        return Promise.resolve(null)
                    }
                }))
                return {
                    type: 'promise',
                    promise: promise.then(values => [values as [...ReturnUnzip<R>]])
                }
            }

        }
        return {
            type: 'done',
        }
    });
}
const fromArray = <T>(values: T[]): RakunIterator<T> => {
    let finish = false
    return getIteratorFromNext<T>(() => {
        if (!finish) {
            finish = true;
            return {
                type: 'values', values
            }
        }
        return {
            type: 'done'
        }
    });
}

const getIteratorFromNext = <T>(next: RakunNext<T>): RakunIterator<T> => {
    return new RakunIteratorImpl(next)
}


export class RakunIteratorImpl<T> implements RakunIterator<T>  {

    constructor(public next: RakunNext<T>) { }
    get iterator() {
        return this;
    }
    flatFilter(fn: (value: T) => RakunIteratorSource<boolean>): RakunIterator<T> {
        return this.zipWhen(fn)
            .flatPipe(([t, b]: [T, boolean]) => {
                if (b) {
                    return empty()
                }
                return just(t)
            })
    }
    filter(fn: (value: T) => boolean): RakunIterator<T> {
        return this.zipWhen((value) => just(fn(value)))
            .flatPipe(([t, b]: [T, boolean]) => {
                if (b) {
                    return empty()
                }
                return just(t)
            })
    }
    thenReturn<R>(value: R): RakunIterator<R> {
        return this.pipe(() => {
            return value
        })
    }
    then<R>(source?: RakunIteratorSource<R>): RakunIterator<typeof Void> | RakunIterator<R> {
        if (!source) {
            return this.pipe(() => {
                return Void
            })
        }
        return this.flatPipe<R>(() => {
            return source
        })
    }
    zip<R extends RakunIteratorSource<any>[]>(...monoArray: R): RakunIterator<[T, ...ReturnUnzip<R>]> {
        return zip([this, ...monoArray]) as RakunIterator<[T, ...ReturnUnzip<R>]>
    }
    zipWhen<R extends ((value: T) => RakunIteratorSource<any>)[]>(...monoArrayFn: R): RakunIterator<[T, ...ReturnUnzipWhen<R>]> {
        return this.flatPipe((v) => {
            return zip([this, ...monoArrayFn.map(fn => fn(v))])
        }) as RakunIterator<[T, ...ReturnUnzipWhen<R>]>
    }
    array(): RakunIterator<T[]> {
        let finish = false;
        return getIteratorFromNext<T[]>((ctx) => {
            if (!finish) {
                finish = true;
                let valuesOrPromises = this.block(ctx)
                if (isNotPromise(valuesOrPromises)) {
                    return {
                        type: 'values',
                        values: [valuesOrPromises]
                    }
                } else {
                    return {
                        type: 'promise',
                        promise: valuesOrPromises.then(item => [item])
                    }
                }
            } else {
                return {
                    type: 'done'
                }
            }

        });
    }
    switchIfEmpty(iterator: RakunIterator<T>): RakunIterator<T> {
        let index = 0;
        let next: (ctx: RakunContextManager) => RakunNextResult<T> = this.next;
        return getIteratorFromNext<T>((ctx) => {
            let item = next(ctx)
            if (item.type == 'done' && index == 0) {
                next = iterator.next
                item = next(ctx)
            }
            index++;
            return item
        })
    }


    defaultIfEmpty(value: T): RakunIterator<T> {
        return this.switchIfEmpty(just(value))
    }


    pipe<R>(fn: (value: T) => R): RakunIterator<R> {
        let next: (ctx: RakunContextManager) => RakunNextResult<T> = this.next;
        return getIteratorFromNext<R>((ctx) => {
            let item = next(ctx)
            if (item.type == 'done') {
                return item
            } else if (item.type == 'promise') {
                return {
                    type: 'promise',
                    promise: item.promise.then(array => array.map(value => fn(value)))
                }
            } else {
                return {
                    type: 'values',
                    values: item.values.map(value => fn(value))
                }
            }
        })
    }
    flatPipe<R>(fn: (value: T) => RakunIteratorSource<R>): RakunIterator<R> {
        let nextIteratorFn = this.pipe(fn).iterator.next;
        return getIteratorFromNext<R>((ctx) => {
            let nextIterator = nextIteratorFn(ctx)
            if (nextIterator.type == 'done') {
                return nextIterator
            } else if (nextIterator.type == 'promise') {
                return {
                    type: 'promise',
                    promise: nextIterator.promise.then(
                        array => Promise.all(
                            array.map(
                                item => Promise.resolve(item.iterator.block(ctx))
                            )
                        ).then(promises => promises.flat())
                    )

                }
            } else {
                const itemsOrPromises = nextIterator.values.map(
                    item => item.iterator.block(ctx)
                )
                const items = itemsOrPromises.filter(isNotPromise)
                if (items.length == itemsOrPromises.length) {
                    return {
                        type: 'values',
                        values: items.flat()
                    }
                } else {
                    return {
                        type: 'promise',
                        promise: Promise.resolve(itemsOrPromises)
                            .then(array => Promise.all(array.map(item => Promise.resolve(item))))
                            .then(array => array.flat())
                    }
                }
            }
        })
    }

    onErrorResume<E>(errorType: ErrorConstructor<E>, fn: (value: E) => RakunIteratorSource<T>): RakunIterator<T> {
        let it = this.iterator;
        return getIteratorFromNext((ctx) => {
            try {
                let item = it.next(ctx);
                return item
            } catch (error) {
                if (error instanceof errorType) {
                    return fn(error).iterator.next(ctx)
                } else {

                    throw error;
                }
            }
        })
    }

    doOnNext(handler: (value: T) => any): RakunIterator<T> {
        let it = this.iterator;
        return getIteratorFromNext((ctx) => {
            let item = it.next(ctx);
            if (item.type == 'promise') {
                item.promise.then((p) => p.map(handler))
            }

            if (item.type == 'values') {
                item.values.map(handler)
            }
            return item
        })
    }

    doOnError(handler: (error: any) => any): RakunIterator<T> {
        let it = this.iterator;
        return getIteratorFromNext((ctx) => {
            try {
                return it.next(ctx);
            } catch (error) {
                handler(error)
                throw error;
            }
        })
    }
    block(ctx: RakunContextManager): Promise<T[]> | T[] {
        let valuesOrPromise: (Promise<T[]> | T[]) = []
        let item = this.next(ctx)
        while (item.type != 'done') {
            item = this.next(ctx)
            if (isNotPromise(valuesOrPromise)) {
                const values: T[] = valuesOrPromise
                if (item.type == 'values') {
                    valuesOrPromise = [...values, ...item.values]
                } else if (item.type == 'promise') {
                    valuesOrPromise = item.promise.then(aar => ([...values, ...aar]))
                }
            } else {
                const promise: Promise<T[]> = valuesOrPromise
                if (item.type == 'values') {
                    const values = item.values
                    valuesOrPromise = promise.then(array => [...array, ...values])
                } else if (item.type == 'promise') {
                    const promise2 = item.promise
                    valuesOrPromise = item.promise.then(aar1 => promise2.then(aar2 => [...aar1, ...aar2]))
                }
            }
        }
        return valuesOrPromise;
    }
    blockFirst(ctx: RakunContextManager): Promise<T> | T | null {
        let item = this.next(ctx)
        if (item.type == 'promise') {
            return item.promise.then(aar1 => aar1[0])
        } else if (item.type == 'values') {
            return item.values[0]
        } else {
            return null
        }

    }

}

export class StaticIteratorImpl implements RakunStaticIterator {
    zip = zip
    error = error
    fromArray = fromArray
    then = then
    empty = empty
    just = just
    fromPromise = fromPromise
}
