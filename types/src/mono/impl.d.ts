import { RakunContextManager } from "../context/interface";
import { RakunAsyncIterator, ReturnUnzip, ReturnUnzipWhen } from "../asyncIterator/interface";
import { Void, WrappedValue_OPAQUE } from "../wrapped";
import { ErrorConstructor, RakunContextManagerCallback, RakunSource } from "../types";
import { RakunMono, RakunStaticMono } from "./interface";
import { RakunFlux } from "../flux";
export declare const fromSourceBuild: <T>(sourceBuild: RakunAsyncIterator<T>) => RakunMono<T>;
export declare class RakunStaticMonoImpl implements RakunStaticMono {
    fromCallback<T>(...callbacks: RakunContextManagerCallback<T | Promise<T>>[]): RakunMono<T>;
    fromSourceBuild: <T>(sourceBuild: RakunAsyncIterator<T>) => RakunMono<T>;
    then(): RakunMono<typeof Void>;
    empty<T>(): RakunMono<T>;
    zip<T extends RakunMono<any>[]>(...monoArray: T): RakunMono<ReturnUnzip<T>>;
    just<T>(value: T): RakunMono<T>;
    fromPromise<T>(promise: Promise<T>): RakunMono<T>;
    error<T>(error: any): RakunMono<T>;
}
export declare class RakunMonoImpl<T> implements RakunMono<T> {
    private _asyncIterator;
    readonly [WrappedValue_OPAQUE] = "mono";
    constructor(_asyncIterator: RakunAsyncIterator<T>);
    flatPipeMany<R>(fn: (value: T) => RakunSource<R>): RakunFlux<R>;
    then<Source extends (RakunMono<any> | RakunFlux<any>)>(source?: Source): Source | RakunMono<typeof Void>;
    iterator(ctx: RakunContextManager): AsyncIterator<T>;
    onErrorResume<E>(errorType: ErrorConstructor<E>, fn: (value: E) => RakunSource<T>): RakunMono<T>;
    doOnNext(handler: (value: T) => any): RakunMono<T>;
    doOnError(handler: (error: any) => any): RakunMono<T>;
    switchIfEmpty(source: RakunSource<T>): RakunMono<T>;
    defaultIfEmpty(value: T): RakunMono<T>;
    zipWhen<R extends ((value: T) => RakunSource<any>)[]>(...monoArrayFn: R): RakunMono<[T, ...ReturnUnzipWhen<R>]>;
    zip<R extends RakunMono<any>[]>(...monoArray: R): RakunMono<[T, ...ReturnUnzip<R>]>;
    pipe<R>(fn: (value: T) => R): RakunMono<R>;
    flatPipe<R>(fn: (value: T) => RakunSource<R>): RakunMono<R>;
    thenReturn<R>(value: R): RakunMono<R>;
    filter(fn: (value: T) => boolean): RakunMono<T>;
    flatFilter(fn: (value: T) => RakunSource<boolean>): RakunMono<T>;
    blockFirst(contextManager?: RakunContextManager): Promise<T>;
    block(contextManager: RakunContextManager): Promise<T[]>;
}
