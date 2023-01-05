



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
    constructor(public asyncIterator: RakunAsyncIterator<T>) {
    }
    [WrappedValue_OPAQUE]: "flux" = 'flux';
    then<Source extends (RakunMono<any> | RakunFlux<any>)>(source?: Source): Source | RakunMono<typeof Void> {
        if (source)
            if (source[WrappedValue_OPAQUE] == 'mono') {
                return monoFromSourceBuild(this.asyncIterator.then(source)) as any
            }
            else {
                return fromSourceBuild(this.asyncIterator.then(source)) as any
            }
        else
            return monoFromSourceBuild(this.asyncIterator.then()) as any
    }
    array(): RakunMono<T[]> {
        return monoFromSourceBuild(asyncIterator.fromCallback(async (ctx) =>
            [await this.asyncIterator.block(ctx)]
        ));
    }
    switchIfEmpty(source: RakunSource<T>): RakunFlux<T> {
        return fromSourceBuild(this.asyncIterator.switchIfEmpty(source))
    }
    defaultIfEmpty(value: T): RakunFlux<T> {
        return fromSourceBuild(this.asyncIterator.defaultIfEmpty(value))
    }

    onErrorResume<E>(errorType: ErrorConstructor<E>, fn: (value: E) => RakunSource<T>): RakunFlux<T> {
        return fromSourceBuild(this.asyncIterator.onErrorResume(errorType, fn))
    }
    doOnNext(handler: (value: T) => any): RakunFlux<T> {
        return fromSourceBuild(this.asyncIterator.doOnNext(handler))
    }
    doOnError(handler: (error: any) => any): RakunFlux<T> {
        return fromSourceBuild(this.asyncIterator.doOnError(handler))
    }

    zipWhen<R extends ((value: T) => RakunSource<any>)[]>(...monoArrayFn: R): RakunFlux<[T, ...ReturnUnzipWhen<R>]> {
        return fromSourceBuild<any>(this.asyncIterator.zipWhen(...monoArrayFn))

    }
    zip<R extends RakunMono<any>[]>(...monoArray: R): RakunFlux<[T, ...ReturnUnzip<R>]> {
        return fromSourceBuild<any>(this.asyncIterator.zip(...monoArray))
    }
    pipe<R>(fn: (value: T) => R): RakunFlux<R> {
        return fromSourceBuild<R>(this.asyncIterator.pipe<R>(fn))
    }
    flatPipe<R>(fn: (value: T) => RakunSource<R>): RakunFlux<R> {
        return fromSourceBuild(this.asyncIterator.flatPipe(fn))
    }

    filter(fn: (value: T) => boolean): RakunFlux<T> {
        return fromSourceBuild(this.asyncIterator.filter(fn))
    }
    flatFilter(fn: (value: T) => RakunSource<boolean>): RakunFlux<T> {
        return fromSourceBuild(this.asyncIterator.flatFilter(fn))
    }
    thenReturn<R>(value: R): RakunFlux<R> {
        return fromSourceBuild(this.asyncIterator.thenReturn(value))
    }


    blockFirst(contextManager?: RakunContextManager): Promise<T> {
        return this.asyncIterator.blockFirst(contextManager ?? new RakunContextManagerImpl());
    }
    block(contextManager: RakunContextManager): Promise<T[]> {
        return this.asyncIterator.block(contextManager)
    }

    iterator(ctx: RakunContextManager): AsyncIterator<T> {
        return this.asyncIterator.iterator(ctx);
    }

}

