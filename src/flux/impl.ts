



import { RakunContextManager } from "../context/interface";
import { RakunMono } from "../mono/interface";
import { ErrorConstructor, ReturnUnzip, ReturnUnzipWhen, UnpackArrayType } from "../types";
import { Void, WrappedValue_OPAQUE } from "../wrapped";
import { RakunFlux, RakunStaticFlux } from "./interface";
import { fromIterator as monofromIterator } from "../mono/impl";
import { RakunContextManagerImpl } from "../context/manager";
import iterator, { RakunIterator } from "../iterator";

export const fromIterator = <T>(iterator: RakunIterator<T>): RakunFlux<T> => {
    return new RakunFluxImpl<T>(iterator);
}
const fromArray = <R>(value: R[]): RakunFlux<R> => {
    return just(...value)
}
const just = <T extends any[]>(...values: T): RakunFlux<UnpackArrayType<T>> => {
    return fromIterator(iterator.just(...values));
}

export class RakunStaticFluxImpl implements RakunStaticFlux {
    fromArray = fromArray
    just = just
}

export class RakunFluxImpl<T> implements RakunFlux<T>{
    constructor(public iterator: RakunIterator<T>) {
    }
    [WrappedValue_OPAQUE]: "flux" = 'flux';
    then<Source extends (RakunMono<any> | RakunFlux<any>)>(source?: Source): Source | RakunMono<typeof Void> {
        if (source)
            if (source[WrappedValue_OPAQUE] == 'mono') {
                return monofromIterator(this.iterator.then(source)) as any
            }
            else {
                return fromIterator(this.iterator.then(source)) as any
            }
        else
            return monofromIterator(this.iterator.then()) as any
    }
    array(): RakunMono<T[]> {
        return monofromIterator(this.iterator.array());
    }
    switchIfEmpty(source: (RakunMono<any> | RakunFlux<any>)): RakunFlux<T> {
        return fromIterator(this.iterator.switchIfEmpty(source))
    }
    defaultIfEmpty(value: T): RakunFlux<T> {
        return fromIterator(this.iterator.defaultIfEmpty(value))
    }

    onErrorResume<E>(errorType: ErrorConstructor<E>, fn: (value: E) => (RakunMono<T> | RakunFlux<T>)): RakunFlux<T> {
        return fromIterator(this.iterator.onErrorResume(errorType, fn))
    }
    doOnNext(handler: (value: T) => any): RakunFlux<T> {
        return fromIterator(this.iterator.doOnNext(handler))
    }
    doOnError(handler: (error: any) => any): RakunFlux<T> {
        return fromIterator(this.iterator.doOnError(handler))
    }

    zipWhen<R extends ((value: T) => (RakunMono<any> | RakunFlux<any>))[]>(...monoArrayFn: R): RakunFlux<[T, ...ReturnUnzipWhen<R>]> {
        return fromIterator<any>(this.iterator.zipWhen(...monoArrayFn))
    }
    zip<R extends RakunMono<any>[]>(...monoArray: R): RakunFlux<[T, ...ReturnUnzip<R>]> {
        return fromIterator<any>(this.iterator.zip(...monoArray))
    }
    pipe<R>(fn: (value: T) => R): RakunFlux<R> {
        return fromIterator<R>(this.iterator.pipe<R>(fn))
    }
    flatPipe<R>(fn: (value: T) => (RakunMono<R> | RakunFlux<R>)): RakunFlux<R> {
        return fromIterator(this.iterator.flatPipe(fn))
    }

    filter(fn: (value: T) => boolean): RakunFlux<T> {
        return fromIterator(this.iterator.filter(fn))
    }
    flatFilter(fn: (value: T) => (RakunMono<boolean> | RakunFlux<boolean>)): RakunFlux<T> {
        return fromIterator(this.iterator.flatFilter(fn))
    }
    thenReturn<R>(value: R): RakunFlux<R> {
        return fromIterator(this.iterator.thenReturn(value))
    }

    blockFirst(contextManager: RakunContextManager): T | Promise<T> | null {
        return this.iterator.blockFirst(contextManager ?? new RakunContextManagerImpl());
    }
    block(contextManager: RakunContextManager): T[] | Promise<T[]> {
        return this.iterator.block(contextManager ?? new RakunContextManagerImpl())
    }

}

