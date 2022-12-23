import { RakunContextManager } from "../context/interface";
import { ErrorConstructor } from "../types";
import { Void, WrappedValue_OPAQUE } from "../wrapped";
export interface RakunSource<T> {
    asyncIterator(ctx: RakunContextManager): AsyncIterator<T>;
    block(contextManager: RakunContextManager): Promise<T[]>;
    blockFirst(contextManager: RakunContextManager): Promise<T>;
    readonly [WrappedValue_OPAQUE]: string;
}
export type ReturnUnzip<T> = {
    [K in keyof T]: T[K] extends RakunSource<infer R> ? R : never;
};
export type ReturnUnzipWhen<T> = {
    [K in keyof T]: T[K] extends (value: any) => RakunSource<infer R> ? R : never;
};
export type RakunCallback<T> = {
    (contextManager: RakunContextManager): T;
};
export interface RakunSourceBuild<T> extends RakunSource<T> {
    flatFilter(fn: (value: T) => RakunSource<boolean>): RakunSourceBuild<T>;
    filter(fn: (value: T) => boolean): RakunSourceBuild<T>;
    thenReturn<R>(value: R): RakunSourceBuild<R>;
    then<R>(source: RakunSource<R>): RakunSourceBuild<R>;
    then(): RakunSourceBuild<typeof Void>;
    zip<R extends RakunSource<any>[]>(...monoArray: R): RakunSourceBuild<[T, ...ReturnUnzip<R>]>;
    zipWhen<R extends ((value: T) => RakunSource<any>)[]>(...monoArrayFn: R): RakunSourceBuild<[T, ...ReturnUnzipWhen<R>]>;
    pipe<R>(fn: (value: T) => R): RakunSourceBuild<R>;
    flatPipe<R>(fn: (value: T) => RakunSource<R>): RakunSourceBuild<R>;
    doOnNext(handler: (value: T) => any): RakunSourceBuild<T>;
    doOnError(handler: (error: any) => any): RakunSourceBuild<T>;
    switchIfEmpty(source: RakunSource<T>): RakunSourceBuild<T>;
    defaultIfEmpty(value: T): RakunSourceBuild<T>;
    onErrorResume<E>(errorType: ErrorConstructor<E>, fn: (value: E) => RakunSource<T>): RakunSourceBuild<T>;
}
export type RakunStaticSourceBuild = {
    then(): RakunSourceBuild<typeof Void>;
    empty<T>(): RakunSourceBuild<T>;
    zip<T extends RakunSource<any>[]>(...monoArray: T): RakunSourceBuild<ReturnUnzip<T>>;
    just<T>(...promises: Promise<T>[] | T[]): RakunSourceBuild<T>;
    error<T>(error: any): RakunSourceBuild<T>;
    fromArray<R>(values: R[] | Promise<R[]>): RakunSourceBuild<R>;
    fromCallback<T>(...callbacks: RakunCallback<T[] | Promise<T[]> | Promise<T>[]>[]): RakunSourceBuild<T>;
};
