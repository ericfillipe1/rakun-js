import { RakunContextManager } from "../context/interface";
import { RakunMono } from "../mono/interface";
import { RakunAsyncIterator, ReturnUnzip, ReturnUnzipWhen } from "../asyncIterator/interface";
import { ErrorConstructor, RakunContextManagerCallback, RakunSource, UnpackArrayType } from "../types";
import { Void, WrappedValue_OPAQUE } from "../wrapped";
import { RakunFlux, RakunStaticFlux } from "./interface";
export declare const fromSourceBuild: <T>(sourceBuild: RakunAsyncIterator<T>) => RakunFlux<T>;
export declare class RakunStaticFluxImpl implements RakunStaticFlux {
    fromCallback<T>(...callbacks: RakunContextManagerCallback<T[] | Promise<T[]> | Promise<T>[]>[]): RakunFlux<T>;
    fromSourceBuild: <T>(sourceBuild: RakunAsyncIterator<T>) => RakunFlux<T>;
    fromPromise<T>(promise: Promise<T[]>): RakunFlux<T>;
    fromArray<R>(values: R[]): RakunFlux<R>;
    just<T extends any[]>(...values: T): RakunFlux<UnpackArrayType<T>>;
}
export declare class RakunFluxImpl<T> implements RakunFlux<T> {
    private _asyncIterator;
    constructor(_asyncIterator: RakunAsyncIterator<T>);
    [WrappedValue_OPAQUE]: "flux";
    then<Source extends (RakunMono<any> | RakunFlux<any>)>(source?: Source): Source | RakunMono<typeof Void>;
    array(): RakunMono<T[]>;
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
    thenReturn<R>(value: R): RakunFlux<R>;
    blockFirst(contextManager?: RakunContextManager): Promise<T>;
    block(contextManager: RakunContextManager): Promise<T[]>;
    iterator(ctx: RakunContextManager): AsyncIterator<T>;
}
