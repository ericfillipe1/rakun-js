import { RakunContextManager } from "../context/interface";
import { ErrorConstructor } from "../types";
import { Void, WrappedValue_OPAQUE } from "../wrapped";
import { RakunCallback, RakunCallbackSource, RakunSourceBuild, RakunSource, ReturnUnzip, ReturnUnzipWhen } from "./interface";
export declare const fromAsyncIterator: <T>(execute: RakunCallbackSource<T>) => RakunSourceBuild<T>;
export declare const resolveArray: <T>(array: T | T[]) => T[];
export declare const fromCallback: <T>(...callbacks: RakunCallback<T>[]) => RakunSourceBuild<T>;
export declare class RakunSourceBuildImpl<T> implements RakunSourceBuild<T> {
    private calback;
    constructor(calback: RakunCallbackSource<T>);
    [WrappedValue_OPAQUE]: string;
    switchIfEmpty(source: RakunSource<T>): RakunSourceBuild<T>;
    defaultIfEmpty(value: T): RakunSourceBuild<T>;
    zip<R extends RakunSource<any>[]>(...sources: R): RakunSourceBuild<[T, ...ReturnUnzip<R>]>;
    zipWhen<R extends ((value: T) => RakunSource<any>)[]>(...sourceFns: R): RakunSourceBuild<[T, ...ReturnUnzipWhen<R>]>;
    flatFilter(fn: (value: T) => RakunSource<boolean>): RakunSourceBuild<T>;
    filter(fn: (value: T) => boolean): RakunSourceBuild<T>;
    thenReturn<R>(value: R): RakunSourceBuild<R>;
    then<R>(source?: RakunSource<R>): RakunSourceBuild<R> | RakunSourceBuild<typeof Void>;
    onErrorResume<E>(errorType: ErrorConstructor<E>, fn: (value: E) => RakunSourceBuild<T>): RakunSourceBuild<T>;
    doOnNext(handler: (value: T) => any): RakunSourceBuild<T>;
    doOnError(handler: (error: any) => any): RakunSourceBuild<T>;
    pipe<R>(fn: (value: T) => R | Promise<R>): RakunSourceBuild<R>;
    flatPipe<R>(fn: (value: T) => RakunSourceBuild<R>): RakunSourceBuild<R>;
    blockFirst(contextManager: RakunContextManager): Promise<T>;
    block(contextManager: RakunContextManager): Promise<T[]>;
    asyncIterator(ctx: RakunContextManager): AsyncIterator<T>;
}
