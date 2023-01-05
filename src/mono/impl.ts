
import { RakunContextManager } from "../context/interface";
import { RakunAsyncIterator, ReturnUnzip, ReturnUnzipWhen } from "../asyncIterator/interface";
import { Void, WrappedValue_OPAQUE } from "../wrapped";
import { ErrorConstructor, RakunContextManagerCallback, RakunSource } from "../types";
import { RakunMono, RakunStaticMono } from "./interface";
import { RakunContextManagerImpl } from "../context/manager";
import { RakunFlux } from "../flux";
import { fromSourceBuild as fluxFromSourceBuild } from "../flux/impl";
import asyncIterator from "../asyncIterator";


export const fromSourceBuild = <T>(sourceBuild: RakunAsyncIterator<T>): RakunMono<T> => {
    return new RakunMonoImpl(sourceBuild);
}


export class RakunStaticMonoImpl implements RakunStaticMono {

    fromCallback<T>(...callbacks: RakunContextManagerCallback<T | Promise<T>>[]): RakunMono<T> {
        return fromSourceBuild<T>(asyncIterator.fromCallback(...callbacks.map(callback => (ctx: RakunContextManager) => Promise.all([callback(ctx)]))));
    }

    fromSourceBuild = fromSourceBuild

    then(): RakunMono<typeof Void> {
        return this.fromSourceBuild(asyncIterator.then())
    }

    empty<T>(): RakunMono<T> {
        return this.fromSourceBuild(asyncIterator.empty())
    }

    zip<T extends RakunMono<any>[]>(...monoArray: T): RakunMono<ReturnUnzip<T>> {
        return this.fromSourceBuild<ReturnUnzip<T>>(asyncIterator.zip<T>(...monoArray))
    }

    just<T>(value: T): RakunMono<T> {
        return this.fromSourceBuild<T>(asyncIterator.just(value));
    }
    fromPromise<T>(promise: Promise<T>) {
        return this.fromSourceBuild<T>(asyncIterator.just(promise));
    }
    error<T>(error: any) {
        return this.fromSourceBuild<T>(asyncIterator.error(error));
    }
}
export class RakunMonoImpl<T> implements RakunMono<T>  {
    readonly [WrappedValue_OPAQUE] = "mono";
    constructor(private _asyncIterator: RakunAsyncIterator<T>) {
    }
    flatPipeMany<R>(fn: (value: T) => RakunSource<R>): RakunFlux<R> {
        return fluxFromSourceBuild(this._asyncIterator.flatPipe(fn))
    }
    then<Source extends (RakunMono<any> | RakunFlux<any>)>(source?: Source): Source | RakunMono<typeof Void> {
        if (source)
            if (source[WrappedValue_OPAQUE] == 'flux') {
                return fluxFromSourceBuild(this._asyncIterator.then(source)) as any
            }
            else {
                return fromSourceBuild(this._asyncIterator.then(source))
            }
        else
            return fromSourceBuild(this._asyncIterator.then())
    }
    iterator(ctx: RakunContextManager): AsyncIterator<T> {
        return this._asyncIterator.iterator(ctx);
    }

    onErrorResume<E>(errorType: ErrorConstructor<E>, fn: (value: E) => RakunSource<T>): RakunMono<T> {
        return fromSourceBuild(this._asyncIterator.onErrorResume(errorType, fn))
    }
    doOnNext(handler: (value: T) => any): RakunMono<T> {
        return fromSourceBuild(this._asyncIterator.doOnNext(handler))
    }
    doOnError(handler: (error: any) => any): RakunMono<T> {
        return fromSourceBuild(this._asyncIterator.doOnError(handler))
    }
    switchIfEmpty(source: RakunSource<T>): RakunMono<T> {
        return fromSourceBuild(this._asyncIterator.switchIfEmpty(source))
    }
    defaultIfEmpty(value: T): RakunMono<T> {
        return fromSourceBuild(this._asyncIterator.defaultIfEmpty(value))
    }
    zipWhen<R extends ((value: T) => RakunSource<any>)[]>(...monoArrayFn: R): RakunMono<[T, ...ReturnUnzipWhen<R>]> {
        return fromSourceBuild<any>(this._asyncIterator.zipWhen(...monoArrayFn))

    }
    zip<R extends RakunMono<any>[]>(...monoArray: R): RakunMono<[T, ...ReturnUnzip<R>]> {
        return fromSourceBuild<any>(this._asyncIterator.zip(...monoArray))
    }
    pipe<R>(fn: (value: T) => R): RakunMono<R> {
        return fromSourceBuild<R>(this._asyncIterator.pipe<R>(fn))
    }
    flatPipe<R>(fn: (value: T) => RakunSource<R>): RakunMono<R> {
        return fromSourceBuild(this._asyncIterator.flatPipe(fn))
    }
    thenReturn<R>(value: R): RakunMono<R> {
        return fromSourceBuild(this._asyncIterator.thenReturn(value))
    }

    filter(fn: (value: T) => boolean): RakunMono<T> {
        return fromSourceBuild(this._asyncIterator.filter(fn))
    }
    flatFilter(fn: (value: T) => RakunSource<boolean>): RakunMono<T> {
        return fromSourceBuild(this._asyncIterator.flatFilter(fn))
    }

    blockFirst(contextManager?: RakunContextManager): Promise<T> {
        return this._asyncIterator.blockFirst(contextManager ?? new RakunContextManagerImpl());
    }
    block(contextManager: RakunContextManager): Promise<T[]> {
        return this._asyncIterator.block(contextManager)
    }

}
