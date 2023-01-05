import { RakunContextManager } from "../context/interface"
import { RakunFlux } from "../flux"
import { RakunAsyncIterator, ReturnUnzip, ReturnUnzipWhen } from "../asyncIterator/interface"
import { ErrorConstructor, RakunContextManagerCallback, RakunSource } from "../types"
import { Void, WrappedValue_OPAQUE } from "../wrapped"
export type RakunMono<T> = {
    readonly [WrappedValue_OPAQUE]: 'mono'
    iterator(ctx: RakunContextManager): AsyncIterator<T>
    zip<R extends RakunMono<any>[]>(...monoArray: R): RakunMono<[T, ...ReturnUnzip<R>]>
    zipWhen<R extends ((value: T) => RakunSource<any>)[]>(...monoArrayFn: R): RakunMono<[T, ...ReturnUnzipWhen<R>]>
    pipe<R>(fn: (value: T) => R): RakunMono<R>
    flatPipe<R>(fn: (value: T) => RakunSource<R>): RakunMono<R>
    flatPipeMany<R>(fn: (value: T) => RakunSource<R>): RakunFlux<R>
    thenReturn<R>(value: R): RakunMono<R>
    then<Source extends RakunMono<any> | RakunFlux<any>>(source: Source): Source;
    then(): RakunMono<typeof Void>
    filter(fn: (value: T) => boolean): RakunMono<T>
    flatFilter(fn: (value: T) => RakunSource<boolean>): RakunMono<T>
    blockFirst(contextManager?: RakunContextManager): Promise<T>
    doOnNext(handler: (value: T) => any): RakunMono<T>
    doOnError(handler: (error: any) => any): RakunMono<T>
    onErrorResume<E>(errorType: ErrorConstructor<E>, fn: (value: E) => RakunSource<T>): RakunMono<T>
    switchIfEmpty(source: RakunSource<T>): RakunMono<T>
    defaultIfEmpty(value: T): RakunMono<T>
}

export type RakunStaticMono = {
    zip<T extends RakunMono<any>[]>(...monoArray: T): RakunMono<ReturnUnzip<T>>;
    just<T>(value: T): RakunMono<T>;
    fromSourceBuild<T>(sourceBuild: RakunAsyncIterator<T>): RakunMono<T>;
    fromPromise<T>(promise: Promise<T>): RakunMono<T>;
    fromCallback<T>(...callbacks: RakunContextManagerCallback<Promise<T> | T>[]): RakunMono<T>;
    then(): RakunMono<typeof Void>;
    empty<T>(): RakunMono<T>;
    error<T>(error: any): RakunMono<T>;
}

