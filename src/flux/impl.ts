



import { RakunContextManager } from "../context/interface";
import { RakunMono } from "../mono/interface";
import { RakunAsyncIterator, ReturnUnzip, ReturnUnzipWhen } from "../asyncIterator/interface";
import { ErrorConstructor, RakunContextManagerCallback, RakunSource, UnpackArrayType } from "../types";
import { Void, WrappedValue_OPAQUE } from "../wrapped";
import { RakunFlux, RakunStaticFlux } from "./interface";
import { fromSourceBuild as monoFromSourceBuild } from "../mono/impl";
import { RakunContextManagerImpl } from "../context/manager";
import asyncIterator from "../asyncIterator";

export const fromSourceBuild = <T>(sourceBuild: RakunAsyncIterator<T>): RakunFlux<T> => {
    return new RakunFluxImpl<T>(sourceBuild);
}


export class RakunStaticFluxImpl implements RakunStaticFlux {
    fromCallback<T>(...callbacks: RakunContextManagerCallback<T[] | Promise<T[]> | Promise<T>[]>[]): RakunFlux<T> {
        return fromSourceBuild<T>(asyncIterator.fromCallback(...callbacks));
    }
    fromSourceBuild = fromSourceBuild
    fromPromise<T>(promise: Promise<T[]>): RakunFlux<T> {
        return fromSourceBuild(asyncIterator.fromArray(promise));
    }
    fromArray<R>(values: R[]): RakunFlux<R> {
        return fromSourceBuild(asyncIterator.fromArray(values));
    }
    just<T extends any[]>(...values: T): RakunFlux<UnpackArrayType<T>> {
        return fromSourceBuild(asyncIterator.fromArray(values));
    }
}

export class RakunFluxImpl<T> implements RakunFlux<T>{
    constructor(private _asyncIterator: RakunAsyncIterator<T>) {
    }
    [WrappedValue_OPAQUE]: "flux" = 'flux';
    then<Source extends (RakunMono<any> | RakunFlux<any>)>(source?: Source): Source | RakunMono<typeof Void> {
        if (source)
            if (source[WrappedValue_OPAQUE] == 'mono') {
                return monoFromSourceBuild(this._asyncIterator.then(source)) as any
            }
            else {
                return fromSourceBuild(this._asyncIterator.then(source)) as any
            }
        else
            return monoFromSourceBuild(this._asyncIterator.then()) as any
    }
    array(): RakunMono<T[]> {
        return monoFromSourceBuild(asyncIterator.fromCallback(async (ctx) =>
            [await this._asyncIterator.block(ctx)]
        ));
    }
    switchIfEmpty(source: RakunSource<T>): RakunFlux<T> {
        return fromSourceBuild(this._asyncIterator.switchIfEmpty(source))
    }
    defaultIfEmpty(value: T): RakunFlux<T> {
        return fromSourceBuild(this._asyncIterator.defaultIfEmpty(value))
    }

    onErrorResume<E>(errorType: ErrorConstructor<E>, fn: (value: E) => RakunSource<T>): RakunFlux<T> {
        return fromSourceBuild(this._asyncIterator.onErrorResume(errorType, fn))
    }
    doOnNext(handler: (value: T) => any): RakunFlux<T> {
        return fromSourceBuild(this._asyncIterator.doOnNext(handler))
    }
    doOnError(handler: (error: any) => any): RakunFlux<T> {
        return fromSourceBuild(this._asyncIterator.doOnError(handler))
    }

    zipWhen<R extends ((value: T) => RakunSource<any>)[]>(...monoArrayFn: R): RakunFlux<[T, ...ReturnUnzipWhen<R>]> {
        return fromSourceBuild<any>(this._asyncIterator.zipWhen(...monoArrayFn))

    }
    zip<R extends RakunMono<any>[]>(...monoArray: R): RakunFlux<[T, ...ReturnUnzip<R>]> {
        return fromSourceBuild<any>(this._asyncIterator.zip(...monoArray))
    }
    pipe<R>(fn: (value: T) => R): RakunFlux<R> {
        return fromSourceBuild<R>(this._asyncIterator.pipe<R>(fn))
    }
    flatPipe<R>(fn: (value: T) => RakunSource<R>): RakunFlux<R> {
        return fromSourceBuild(this._asyncIterator.flatPipe(fn))
    }

    filter(fn: (value: T) => boolean): RakunFlux<T> {
        return fromSourceBuild(this._asyncIterator.filter(fn))
    }
    flatFilter(fn: (value: T) => RakunSource<boolean>): RakunFlux<T> {
        return fromSourceBuild(this._asyncIterator.flatFilter(fn))
    }
    thenReturn<R>(value: R): RakunFlux<R> {
        return fromSourceBuild(this._asyncIterator.thenReturn(value))
    }


    blockFirst(contextManager?: RakunContextManager): Promise<T> {
        return this._asyncIterator.blockFirst(contextManager ?? new RakunContextManagerImpl());
    }
    block(contextManager: RakunContextManager): Promise<T[]> {
        return this._asyncIterator.block(contextManager)
    }

    iterator(ctx: RakunContextManager): AsyncIterator<T> {
        return this._asyncIterator.iterator(ctx);
    }

}

