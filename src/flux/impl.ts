



import { RakunContextManager } from "../context/interface";
import { RakunMono } from "../mono/interface";
import { RakunSource, RakunSourceBuild, ReturnUnzip, ReturnUnzipWhen } from "../sourceBuild/interface";
import { ErrorConstructor } from "../types";
import { Void, WrappedValue_OPAQUE } from "../wrapped";
import { RakunFlux } from "./interface";
import mono from "../mono";
import { sourceBuild } from "../sourceBuild/static";
import { RakunContextManagerImpl } from "../context/manager";


export const fromSourceBuild = <T>(sourceBuild: RakunSourceBuild<T>): RakunFlux<T> => {
    return new RakunFluxImpl<T>(sourceBuild);
}

export class RakunFluxImpl<T> implements RakunFlux<T>{
    readonly [WrappedValue_OPAQUE] = "flux"
    constructor(public sourceBuild: RakunSourceBuild<T>) {
    }
    block(contextManager?: RakunContextManager): Promise<T[]> {
        return this.sourceBuild.block(contextManager ?? new RakunContextManagerImpl())
    }
    array(): RakunMono<T[]> {
        return mono.fromSourceBuild(sourceBuild.fromCallback(async (ctx) =>
            [await this.sourceBuild.block(ctx)]
        ));
    }
    asyncIterator(ctx: RakunContextManager): AsyncIterator<T> {
        return this.sourceBuild.asyncIterator(ctx);
    }

    switchIfEmpty(source: RakunSource<T>): RakunFlux<T> {
        return fromSourceBuild(this.sourceBuild.switchIfEmpty(source))
    }
    defaultIfEmpty(value: T): RakunFlux<T> {
        return fromSourceBuild(this.sourceBuild.defaultIfEmpty(value))
    }

    onErrorResume<E>(errorType: ErrorConstructor<E>, fn: (value: E) => RakunMono<T>): RakunFlux<T> {
        return fromSourceBuild(this.sourceBuild.onErrorResume(errorType, fn))
    }
    doOnNext(handler: (value: T) => any): RakunFlux<T> {
        return fromSourceBuild(this.sourceBuild.doOnNext(handler))
    }
    doOnError(handler: (error: any) => any): RakunFlux<T> {
        return fromSourceBuild(this.sourceBuild.doOnError(handler))
    }

    zipWhen<R extends ((value: T) => RakunMono<any>)[]>(...monoArrayFn: R): RakunFlux<[T, ...ReturnUnzipWhen<R>]> {
        return fromSourceBuild<any>(this.sourceBuild.zipWhen(...monoArrayFn))

    }
    zip<R extends RakunMono<any>[]>(...monoArray: R): RakunFlux<[T, ...ReturnUnzip<R>]> {
        return fromSourceBuild<any>(this.sourceBuild.zip(...monoArray))
    }
    pipe<R>(fn: (value: T) => R): RakunFlux<R> {
        return fromSourceBuild<R>(this.sourceBuild.pipe<R>(fn))
    }
    flatPipe<R>(fn: (value: T) => RakunSource<R>): RakunFlux<R> {
        return fromSourceBuild(this.sourceBuild.flatPipe(fn))
    }

    filter(fn: (value: T) => boolean): RakunFlux<T> {
        return fromSourceBuild(this.sourceBuild.filter(fn))
    }
    flatFilter(fn: (value: T) => RakunMono<boolean>): RakunFlux<T> {
        return fromSourceBuild(this.sourceBuild.flatFilter(fn))
    }

    blockFirst(contextManager?: RakunContextManager): Promise<T> {
        return this.sourceBuild.blockFirst(contextManager ?? new RakunContextManagerImpl());
    }


    thenReturn<R>(value: R): RakunFlux<R> {
        return fromSourceBuild(this.sourceBuild.thenReturn(value))
    }
    then<R>(source?: RakunSource<R>): RakunFlux<R> | RakunFlux<Void> {
        if (source)
            return fromSourceBuild(this.sourceBuild.then(source))
        else
            return fromSourceBuild(this.sourceBuild.then())
    }
}

