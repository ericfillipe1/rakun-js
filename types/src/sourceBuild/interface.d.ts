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
export interface RakunAsyncIterator<T> extends RakunSource<T> {
    flatFilter(fn: (value: T) => RakunSource<boolean>): RakunAsyncIterator<T>;
    filter(fn: (value: T) => boolean): RakunAsyncIterator<T>;
    thenReturn<R>(value: R): RakunAsyncIterator<R>;
    then<R>(source: RakunSource<R>): RakunAsyncIterator<R>;
    then(): RakunAsyncIterator<typeof Void>;
    zip<R extends RakunSource<any>[]>(...monoArray: R): RakunAsyncIterator<[T, ...ReturnUnzip<R>]>;
    zipWhen<R extends ((value: T) => RakunSource<any>)[]>(...monoArrayFn: R): RakunAsyncIterator<[T, ...ReturnUnzipWhen<R>]>;
    pipe<R>(fn: (value: T) => R): RakunAsyncIterator<R>;
    flatPipe<R>(fn: (value: T) => RakunSource<R>): RakunAsyncIterator<R>;
    doOnNext(handler: (value: T) => any): RakunAsyncIterator<T>;
    doOnError(handler: (error: any) => any): RakunAsyncIterator<T>;
    switchIfEmpty(source: RakunSource<T>): RakunAsyncIterator<T>;
    defaultIfEmpty(value: T): RakunAsyncIterator<T>;
    onErrorResume<E>(errorType: ErrorConstructor<E>, fn: (value: E) => RakunSource<T>): RakunAsyncIterator<T>;
}
export type RakunStaticSourceBuild = {
    then(): RakunAsyncIterator<typeof Void>;
    empty<T>(): RakunAsyncIterator<T>;
    zip<T extends RakunSource<any>[]>(...monoArray: T): RakunAsyncIterator<ReturnUnzip<T>>;
    just<T>(...promises: Promise<T>[] | T[]): RakunAsyncIterator<T>;
    error<T>(error: any): RakunAsyncIterator<T>;
    fromArray<R>(values: R[] | Promise<R[]>): RakunAsyncIterator<R>;
    fromCallback<T>(...callbacks: RakunCallback<T[] | Promise<T[]> | Promise<T>[]>[]): RakunAsyncIterator<T>;
};
