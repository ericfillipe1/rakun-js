
import { RakunContextManager } from "../context/interface";
import { RakunSource, RakunSourceBuild, ReturnUnzip, ReturnUnzipWhen } from "../sourceBuild/interface";
import { Void, WrappedValue_OPAQUE } from "../wrapped";
import { ErrorConstructor } from "../types";
import { RakunMono } from "./interface";
import { RakunContextManagerImpl } from "../context/manager";
import { RakunFlux } from "../flux";
import { fromSourceBuild as fluxFromSourceBuild } from "../flux/functions";
import { fromSourceBuild } from "./functions";

export class RakunMonoImpl<T> implements RakunMono<T>  {
    readonly [WrappedValue_OPAQUE] = "mono";
    constructor(public sourceBuild: RakunSourceBuild<T>) {
    }
    then<Source extends (RakunMono<any> | RakunFlux<any>)>(source?: Source): Source | RakunMono<typeof Void> {
        if (source)
            if (source[WrappedValue_OPAQUE] == 'flux') {
                return fluxFromSourceBuild(this.sourceBuild.then(source)) as any
            }
            else {
                return fromSourceBuild(this.sourceBuild.then(source))
            }
        else
            return fromSourceBuild(this.sourceBuild.then())
    }

    asyncIterator(ctx: RakunContextManager): AsyncIterator<T, any, undefined> {
        return this.sourceBuild.asyncIterator(ctx);
    }

    onErrorResume<E>(errorType: ErrorConstructor<E>, fn: (value: E) => RakunMono<T>): RakunMono<T> {
        return fromSourceBuild(this.sourceBuild.onErrorResume(errorType, fn))
    }
    doOnNext(handler: (value: T) => any): RakunMono<T> {
        return fromSourceBuild(this.sourceBuild.doOnNext(handler))
    }
    doOnError(handler: (error: any) => any): RakunMono<T> {
        return fromSourceBuild(this.sourceBuild.doOnError(handler))
    }

    switchIfEmpty(source: RakunSource<T>): RakunMono<T> {
        return fromSourceBuild(this.sourceBuild.switchIfEmpty(source))
    }
    defaultIfEmpty(value: T): RakunMono<T> {
        return fromSourceBuild(this.sourceBuild.defaultIfEmpty(value))
    }
    zipWhen<R extends ((value: T) => RakunMono<any>)[]>(...monoArrayFn: R): RakunMono<[T, ...ReturnUnzipWhen<R>]> {
        return fromSourceBuild<any>(this.sourceBuild.zipWhen(...monoArrayFn))

    }
    zip<R extends RakunMono<any>[]>(...monoArray: R): RakunMono<[T, ...ReturnUnzip<R>]> {
        return fromSourceBuild<any>(this.sourceBuild.zip(...monoArray))
    }
    pipe<R>(fn: (value: T) => R): RakunMono<R> {
        return fromSourceBuild<R>(this.sourceBuild.pipe<R>(fn))
    }
    flatPipe<R>(fn: (value: T) => RakunMono<R>): RakunMono<R> {
        return fromSourceBuild(this.sourceBuild.flatPipe(fn))
    }
    thenReturn<R>(value: R): RakunMono<R> {
        return fromSourceBuild(this.sourceBuild.thenReturn(value))
    }
    async blockFirst(contextManager?: RakunContextManager): Promise<T> {
        const array = await this.sourceBuild.block(contextManager ?? new RakunContextManagerImpl());
        return array[0];
    }

    filter(fn: (value: T) => boolean): RakunMono<T> {
        return fromSourceBuild(this.sourceBuild.filter(fn))
    }
    flatFilter(fn: (value: T) => RakunMono<boolean>): RakunMono<T> {
        return fromSourceBuild(this.sourceBuild.flatFilter(fn))
    }

    block(contextManager: RakunContextManager): Promise<T[]> {
        return this.sourceBuild.block(contextManager)
    }
}
