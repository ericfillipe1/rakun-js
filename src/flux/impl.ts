



import { RakunContextManager } from "../context/interface";
import { RakunMono } from "../mono/interface";
import { RakunSource, RakunSourceBuild, ReturnUnzip, ReturnUnzipWhen } from "../sourceBuild/interface";
import { ErrorConstructor } from "../types";
import { Void, WrappedValue_OPAQUE } from "../wrapped";
import { RakunFlux } from "./interface";
import { fromSourceBuild as monoFromSourceBuild } from "../mono/functions";
import { sourceBuild } from "../sourceBuild/static";
import { RakunContextManagerImpl } from "../context/manager";
import { fromSourceBuild } from "./functions";


export class RakunFluxImpl<T> implements RakunFlux<T>{
    constructor(public sourceBuild: RakunSourceBuild<T>) {
    }
    [WrappedValue_OPAQUE]: "flux" = 'flux';
    then<Source extends (RakunMono<any> | RakunFlux<any>)>(source?: Source): Source | RakunMono<typeof Void> {
        if (source)
            if (source[WrappedValue_OPAQUE] == 'mono') {
                return monoFromSourceBuild(this.sourceBuild.then(source)) as any
            }
            else {
                return fromSourceBuild(this.sourceBuild.then(source)) as any
            }
        else
            return fromSourceBuild(this.sourceBuild.then()) as any
    }

    block(contextManager?: RakunContextManager): Promise<T[]> {
        return this.sourceBuild.block(contextManager ?? new RakunContextManagerImpl())
    }
    array(): RakunMono<T[]> {
        return monoFromSourceBuild(sourceBuild.fromCallback(async (ctx) =>
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
}

