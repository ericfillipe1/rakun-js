



import { RakunContextManager } from "../context/interface";
import { RakunMono } from "../mono/interface";
import { RakunAsyncIterator, ReturnUnzip, ReturnUnzipWhen } from "../asyncIterator/interface";
import { ErrorConstructor, RakunExec, RakunSource, UnpackArrayType } from "../types";
import { Void, WrappedValue_OPAQUE } from "../wrapped";
import { RakunFlux, RakunStaticFlux } from "./interface";
import { fromAsyncIterator as monofromAsyncIterator } from "../mono/impl";
import { RakunContextManagerImpl } from "../context/manager";
import asyncIterator from "../asyncIterator";

export const fromAsyncIterator = <T>(asyncIterator: RakunAsyncIterator<T>): RakunFlux<T> => {
    return new RakunFluxImpl<T>(asyncIterator);
}

const fromExecute = <T>(execute: RakunExec<T>): RakunFlux<T> => {
    return fromAsyncIterator(asyncIterator.fromExecute(execute));
}
const fromArray = <R>(value: R[]): RakunFlux<R> => {
    return just(...value)
}
const just = <T extends any[]>(...values: T): RakunFlux<UnpackArrayType<T>> => {
    return fromAsyncIterator(asyncIterator.just(...values));
}

export class RakunStaticFluxImpl implements RakunStaticFlux {
    fromExecute = fromExecute
    fromArray = fromArray
    fromAsyncIterator = fromAsyncIterator
    just = just
}

export class RakunFluxImpl<T> implements RakunFlux<T>{
    constructor(private _asyncIterator: RakunAsyncIterator<T>) {
    }
    get exec(): RakunExec<T> {
        return this._asyncIterator.exec
    }

    [WrappedValue_OPAQUE]: "flux" = 'flux';
    then<Source extends (RakunMono<any> | RakunFlux<any>)>(source?: Source): Source | RakunMono<typeof Void> {
        if (source)
            if (source[WrappedValue_OPAQUE] == 'mono') {
                return monofromAsyncIterator(this._asyncIterator.then(source)) as any
            }
            else {
                return fromAsyncIterator(this._asyncIterator.then(source)) as any
            }
        else
            return monofromAsyncIterator(this._asyncIterator.then()) as any
    }
    array(): RakunMono<T[]> {
        return monofromAsyncIterator(this._asyncIterator.array());
    }
    switchIfEmpty(source: RakunSource<T>): RakunFlux<T> {
        return fromAsyncIterator(this._asyncIterator.switchIfEmpty(source))
    }
    defaultIfEmpty(value: T): RakunFlux<T> {
        return fromAsyncIterator(this._asyncIterator.defaultIfEmpty(value))
    }

    onErrorResume<E>(errorType: ErrorConstructor<E>, fn: (value: E) => RakunSource<T>): RakunFlux<T> {
        return fromAsyncIterator(this._asyncIterator.onErrorResume(errorType, fn))
    }
    doOnNext(handler: (value: T) => any): RakunFlux<T> {
        return fromAsyncIterator(this._asyncIterator.doOnNext(handler))
    }
    doOnError(handler: (error: any) => any): RakunFlux<T> {
        return fromAsyncIterator(this._asyncIterator.doOnError(handler))
    }

    zipWhen<R extends ((value: T) => RakunSource<any>)[]>(...monoArrayFn: R): RakunFlux<[T, ...ReturnUnzipWhen<R>]> {
        return fromAsyncIterator<any>(this._asyncIterator.zipWhen(...monoArrayFn))

    }
    zip<R extends RakunMono<any>[]>(...monoArray: R): RakunFlux<[T, ...ReturnUnzip<R>]> {
        return fromAsyncIterator<any>(this._asyncIterator.zip(...monoArray))
    }
    pipe<R>(fn: (value: T) => R): RakunFlux<R> {
        return fromAsyncIterator<R>(this._asyncIterator.pipe<R>(fn))
    }
    flatPipe<R>(fn: (value: T) => RakunSource<R>): RakunFlux<R> {
        return fromAsyncIterator(this._asyncIterator.flatPipe(fn))
    }

    filter(fn: (value: T) => boolean): RakunFlux<T> {
        return fromAsyncIterator(this._asyncIterator.filter(fn))
    }
    flatFilter(fn: (value: T) => RakunSource<boolean>): RakunFlux<T> {
        return fromAsyncIterator(this._asyncIterator.flatFilter(fn))
    }
    thenReturn<R>(value: R): RakunFlux<R> {
        return fromAsyncIterator(this._asyncIterator.thenReturn(value))
    }

    blockFirst(contextManager: RakunContextManager): T | Promise<T> {
        return this._asyncIterator.blockFirst(contextManager ?? new RakunContextManagerImpl());
    }
    block(contextManager: RakunContextManager): T[] | Promise<T[]> {
        return this._asyncIterator.block(contextManager ?? new RakunContextManagerImpl())
    }

}

