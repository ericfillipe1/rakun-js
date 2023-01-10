
import { RakunContextManager } from "../context/interface";
import { RakunAsyncIterator, ReturnUnzip, ReturnUnzipWhen } from "../asyncIterator/interface";
import { Void, WrappedValue_OPAQUE } from "../wrapped";
import { ErrorConstructor, RakunContextManagerCallback, RakunExec, RakunSource } from "../types";
import { RakunMono, RakunStaticMono } from "./interface";
import { RakunContextManagerImpl } from "../context/manager";
import { RakunFlux } from "../flux";
import { fromAsyncIterator as fluxfromAsyncIterator } from "../flux/impl";
import asyncIterator from "../asyncIterator";


export const fromAsyncIterator = <T>(asyncIterator: RakunAsyncIterator<T>): RakunMono<T> => {
    return new RakunMonoImpl(asyncIterator);
}


export class RakunStaticMonoImpl implements RakunStaticMono {
    fromPromiseCallback<T>(callback: RakunContextManagerCallback<Promise<T>[]>): RakunMono<T> {
        return fromAsyncIterator(asyncIterator.fromPromiseCallback(callback));
    }

    fromExecute<T>(execute: RakunExec<T>): RakunMono<T> {
        return fromAsyncIterator(asyncIterator.fromExecute(execute));
    }
    fromAsyncIterator = fromAsyncIterator

    then(): RakunMono<typeof Void> {
        return this.fromAsyncIterator(asyncIterator.then())
    }

    empty<T>(): RakunMono<T> {
        return this.fromAsyncIterator(asyncIterator.empty())
    }

    zip<T extends RakunMono<any>[]>(...monoArray: T): RakunMono<ReturnUnzip<T>> {
        return this.fromAsyncIterator<ReturnUnzip<T>>(asyncIterator.zip<T>(...monoArray))
    }

    just<T>(value: T): RakunMono<T> {
        return this.fromAsyncIterator<T>(asyncIterator.just(value));
    }
    error<T>(error: any) {
        return this.fromAsyncIterator<T>(asyncIterator.error(error));
    }
}
export class RakunMonoImpl<T> implements RakunMono<T>  {
    readonly [WrappedValue_OPAQUE] = "mono";
    constructor(private _asyncIterator: RakunAsyncIterator<T>) {
    }
    get exec(): RakunExec<T> {
        return this._asyncIterator.exec
    }

    flatPipeMany<R>(fn: (value: T) => RakunSource<R>): RakunFlux<R> {
        return fluxfromAsyncIterator(this._asyncIterator.flatPipe(fn))
    }
    then<Source extends (RakunMono<any> | RakunFlux<any>)>(source?: Source): Source | RakunMono<typeof Void> {
        if (source)
            if (source[WrappedValue_OPAQUE] == 'flux') {
                return fluxfromAsyncIterator(this._asyncIterator.then(source)) as any
            }
            else {
                return fromAsyncIterator(this._asyncIterator.then(source))
            }
        else
            return fromAsyncIterator(this._asyncIterator.then())
    }

    onErrorResume<E>(errorType: ErrorConstructor<E>, fn: (value: E) => RakunSource<T>): RakunMono<T> {
        return fromAsyncIterator(this._asyncIterator.onErrorResume(errorType, fn))
    }
    doOnNext(handler: (value: T) => any): RakunMono<T> {
        return fromAsyncIterator(this._asyncIterator.doOnNext(handler))
    }
    doOnError(handler: (error: any) => any): RakunMono<T> {
        return fromAsyncIterator(this._asyncIterator.doOnError(handler))
    }
    switchIfEmpty(source: RakunSource<T>): RakunMono<T> {
        return fromAsyncIterator(this._asyncIterator.switchIfEmpty(source))
    }
    defaultIfEmpty(value: T): RakunMono<T> {
        return fromAsyncIterator(this._asyncIterator.defaultIfEmpty(value))
    }
    zipWhen<R extends ((value: T) => RakunSource<any>)[]>(...monoArrayFn: R): RakunMono<[T, ...ReturnUnzipWhen<R>]> {
        return fromAsyncIterator<any>(this._asyncIterator.zipWhen(...monoArrayFn))

    }
    zip<R extends RakunMono<any>[]>(...monoArray: R): RakunMono<[T, ...ReturnUnzip<R>]> {
        return fromAsyncIterator<any>(this._asyncIterator.zip(...monoArray))
    }
    pipe<R>(fn: (value: T) => R): RakunMono<R> {
        return fromAsyncIterator<R>(this._asyncIterator.pipe<R>(fn))
    }
    flatPipe<R>(fn: (value: T) => RakunSource<R>): RakunMono<R> {
        return fromAsyncIterator(this._asyncIterator.flatPipe(fn))
    }
    thenReturn<R>(value: R): RakunMono<R> {
        return fromAsyncIterator(this._asyncIterator.thenReturn(value))
    }

    filter(fn: (value: T) => boolean): RakunMono<T> {
        return fromAsyncIterator(this._asyncIterator.filter(fn))
    }
    flatFilter(fn: (value: T) => RakunSource<boolean>): RakunMono<T> {
        return fromAsyncIterator(this._asyncIterator.flatFilter(fn))
    }

    blockFirst(contextManager: RakunContextManager): T | Promise<T> {
        return this._asyncIterator.blockFirst(contextManager ?? new RakunContextManagerImpl());
    }
    block(contextManager: RakunContextManager): T[] | Promise<T[]> {
        return this._asyncIterator.block(contextManager ?? new RakunContextManagerImpl())
    }

}
