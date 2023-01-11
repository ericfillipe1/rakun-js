
import { RakunContextManager } from "../context/interface";
import { Void, WrappedValue_OPAQUE } from "../wrapped";
import { ErrorConstructor, ReturnUnzip, ReturnUnzipWhen } from "../types";
import { RakunMono, RakunStaticMono } from "./interface";
import { RakunContextManagerImpl } from "../context/manager";
import { RakunFlux } from "../flux";
import { fromIterator as fluxfromIterator } from "../flux/impl";
import iterator, { RakunIterator } from "../iterator";

export const fromIterator = <T>(iterator: RakunIterator<T>): RakunMono<T> => {
    return new RakunMonoImpl(iterator);
}


export class RakunStaticMonoImpl implements RakunStaticMono {

    fromIterator = fromIterator

    then(): RakunMono<typeof Void> {
        return this.fromIterator(iterator.then())
    }

    empty<T>(): RakunMono<T> {
        return this.fromIterator(iterator.empty())
    }

    zip<R extends RakunMono<any>[]>(monoArray: R): RakunMono<[...ReturnUnzip<R>]> {
        return fromIterator<any>(iterator.zip(monoArray))
    }

    just<T>(value: T): RakunMono<T> {
        return this.fromIterator<T>(iterator.just(value));
    }
    error<T>(error: any) {
        return this.fromIterator<T>(iterator.error(error));
    }
}
export class RakunMonoImpl<T> implements RakunMono<T>  {
    readonly [WrappedValue_OPAQUE] = "mono";
    constructor(public iterator: RakunIterator<T>) {
    }

    flatPipeMany<R>(fn: (value: T) => (RakunMono<R> | RakunFlux<R>)): RakunFlux<R> {
        return fluxfromIterator(this.iterator.flatPipe(fn))
    }
    then<Source extends (RakunMono<any> | RakunFlux<any>)>(source?: Source): Source | RakunMono<typeof Void> {
        if (source)
            if (source[WrappedValue_OPAQUE] == 'flux') {
                return fluxfromIterator(this.iterator.then(source)) as any
            }
            else {
                return fromIterator(this.iterator.then(source))
            }
        else
            return fromIterator(this.iterator.then())
    }

    onErrorResume<E>(errorType: ErrorConstructor<E>, fn: (value: E) => (RakunMono<T> | RakunFlux<T>)): RakunMono<T> {
        return fromIterator(this.iterator.onErrorResume(errorType, fn))
    }
    doOnNext(handler: (value: T) => any): RakunMono<T> {
        return fromIterator(this.iterator.doOnNext(handler))
    }
    doOnError(handler: (error: any) => any): RakunMono<T> {
        return fromIterator(this.iterator.doOnError(handler))
    }
    switchIfEmpty(source: (RakunMono<any> | RakunFlux<any>)): RakunMono<T> {
        return fromIterator(this.iterator.switchIfEmpty(source))
    }
    defaultIfEmpty(value: T): RakunMono<T> {
        return fromIterator(this.iterator.defaultIfEmpty(value))
    }
    zipWhen<R extends ((value: T) => (RakunMono<any> | RakunFlux<any>))[]>(...monoArrayFn: R): RakunMono<[T, ...ReturnUnzipWhen<R>]> {
        return fromIterator<any>(this.iterator.zipWhen(...monoArrayFn))
    }
    zip<R extends RakunMono<any>[]>(...monoArray: R): RakunMono<[T, ...ReturnUnzip<R>]> {
        return fromIterator<any>(this.iterator.zip(...monoArray))
    }
    pipe<R>(fn: (value: T) => R): RakunMono<R> {
        return fromIterator<R>(this.iterator.pipe<R>(fn))
    }
    flatPipe<R>(fn: (value: T) => (RakunMono<R> | RakunFlux<R>)): RakunMono<R> {
        return fromIterator(this.iterator.flatPipe(fn))
    }
    thenReturn<R>(value: R): RakunMono<R> {
        return fromIterator(this.iterator.thenReturn(value))
    }

    filter(fn: (value: T) => boolean): RakunMono<T> {
        return fromIterator(this.iterator.filter(fn))
    }
    flatFilter(fn: (value: T) => (RakunMono<boolean> | RakunFlux<boolean>)): RakunMono<T> {
        return fromIterator(this.iterator.flatFilter(fn))
    }

    blockFirst(contextManager: RakunContextManager): T | Promise<T> | null {
        return this.iterator.blockFirst(contextManager ?? new RakunContextManagerImpl());
    }
    block(contextManager: RakunContextManager): T[] | Promise<T[]> {
        return this.iterator.block(contextManager ?? new RakunContextManagerImpl())
    }

}
