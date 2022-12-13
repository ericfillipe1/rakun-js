import { RakunContextManager } from "../context/interface";
import { RakunMono } from "../mono/interface";
import { RakunSource, RakunSourceBuild, ReturnUnzip, ReturnUnzipWhen } from "../sourceBuild/interface";
import { ErrorConstructor } from "../types";
import { Void, WrappedValue_OPAQUE } from "../wrapped";
import { RakunFlux } from "./interface";
export declare class RakunFluxImpl<T> implements RakunFlux<T> {
    sourceBuild: RakunSourceBuild<T>;
    constructor(sourceBuild: RakunSourceBuild<T>);
    [WrappedValue_OPAQUE]: "flux";
    then<Source extends (RakunMono<any> | RakunFlux<any>)>(source?: Source): Source | RakunMono<typeof Void>;
    block(contextManager?: RakunContextManager): Promise<T[]>;
    array(): RakunMono<T[]>;
    asyncIterator(ctx: RakunContextManager): AsyncIterator<T>;
    switchIfEmpty(source: RakunSource<T>): RakunFlux<T>;
    defaultIfEmpty(value: T): RakunFlux<T>;
    onErrorResume<E>(errorType: ErrorConstructor<E>, fn: (value: E) => RakunSource<T>): RakunFlux<T>;
    doOnNext(handler: (value: T) => any): RakunFlux<T>;
    doOnError(handler: (error: any) => any): RakunFlux<T>;
    zipWhen<R extends ((value: T) => RakunSource<any>)[]>(...monoArrayFn: R): RakunFlux<[T, ...ReturnUnzipWhen<R>]>;
    zip<R extends RakunMono<any>[]>(...monoArray: R): RakunFlux<[T, ...ReturnUnzip<R>]>;
    pipe<R>(fn: (value: T) => R): RakunFlux<R>;
    flatPipe<R>(fn: (value: T) => RakunSource<R>): RakunFlux<R>;
    filter(fn: (value: T) => boolean): RakunFlux<T>;
    flatFilter(fn: (value: T) => RakunSource<boolean>): RakunFlux<T>;
    blockFirst(contextManager?: RakunContextManager): Promise<T>;
    thenReturn<R>(value: R): RakunFlux<R>;
}
