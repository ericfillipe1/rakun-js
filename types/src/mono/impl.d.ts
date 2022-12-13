import { RakunContextManager } from "../context/interface";
import { RakunSource, RakunSourceBuild, ReturnUnzip, ReturnUnzipWhen } from "../sourceBuild/interface";
import { Void, WrappedValue_OPAQUE } from "../wrapped";
import { ErrorConstructor } from "../types";
import { RakunMono } from "./interface";
import { RakunFlux } from "../flux";
export declare class RakunMonoImpl<T> implements RakunMono<T> {
    sourceBuild: RakunSourceBuild<T>;
    readonly [WrappedValue_OPAQUE] = "mono";
    constructor(sourceBuild: RakunSourceBuild<T>);
    then<Source extends (RakunMono<any> | RakunFlux<any>)>(source?: Source): Source | RakunMono<typeof Void>;
    asyncIterator(ctx: RakunContextManager): AsyncIterator<T, any, undefined>;
    onErrorResume<E>(errorType: ErrorConstructor<E>, fn: (value: E) => RakunMono<T>): RakunMono<T>;
    doOnNext(handler: (value: T) => any): RakunMono<T>;
    doOnError(handler: (error: any) => any): RakunMono<T>;
    switchIfEmpty(source: RakunSource<T>): RakunMono<T>;
    defaultIfEmpty(value: T): RakunMono<T>;
    zipWhen<R extends ((value: T) => RakunMono<any>)[]>(...monoArrayFn: R): RakunMono<[T, ...ReturnUnzipWhen<R>]>;
    zip<R extends RakunMono<any>[]>(...monoArray: R): RakunMono<[T, ...ReturnUnzip<R>]>;
    pipe<R>(fn: (value: T) => R): RakunMono<R>;
    flatPipe<R>(fn: (value: T) => RakunMono<R>): RakunMono<R>;
    thenReturn<R>(value: R): RakunMono<R>;
    blockFirst(contextManager?: RakunContextManager): Promise<T>;
    filter(fn: (value: T) => boolean): RakunMono<T>;
    flatFilter(fn: (value: T) => RakunMono<boolean>): RakunMono<T>;
    block(contextManager: RakunContextManager): Promise<T[]>;
}
