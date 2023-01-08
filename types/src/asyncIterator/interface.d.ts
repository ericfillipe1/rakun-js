import { RakunContextManager } from "../context/interface";
import { ErrorConstructor, RakunAsyncIteratorSource, RakunContextManagerCallback, RakunSource } from "../types";
import { Void, WrappedValue_OPAQUE } from "../wrapped";
export type ReturnUnzip<T> = {
    [K in keyof T]: T[K] extends RakunAsyncIterator<infer R> ? R : never;
};
export type ReturnUnzipWhen<T> = {
    [K in keyof T]: T[K] extends (value: any) => RakunAsyncIterator<infer R> ? R : never;
};
export interface RakunAsyncIterator<T> {
    block(contextManager: RakunContextManager): Promise<T[]>;
    blockFirst(contextManager: RakunContextManager): Promise<T>;
    readonly [WrappedValue_OPAQUE]: 'asyncIterator';
    iterator(ctx: RakunContextManager): AsyncIterator<T>;
    flatFilter(fn: (value: T) => RakunAsyncIteratorSource<boolean>): RakunAsyncIterator<T>;
    filter(fn: (value: T) => boolean): RakunAsyncIterator<T>;
    thenReturn<R>(value: R): RakunAsyncIterator<R>;
    then<R>(source: RakunAsyncIteratorSource<R>): RakunAsyncIterator<R>;
    then(): RakunAsyncIterator<typeof Void>;
    zip<R extends RakunAsyncIteratorSource<any>[]>(...monoArray: R): RakunAsyncIterator<[T, ...ReturnUnzip<R>]>;
    zipWhen<R extends ((value: T) => RakunAsyncIteratorSource<any>)[]>(...monoArrayFn: R): RakunAsyncIterator<[T, ...ReturnUnzipWhen<R>]>;
    pipe<R>(fn: (value: T) => R): RakunAsyncIterator<R>;
    flatPipe<R>(fn: (value: T) => RakunAsyncIteratorSource<R>): RakunAsyncIterator<R>;
    doOnNext(handler: (value: T) => any): RakunAsyncIterator<T>;
    doOnError(handler: (error: any) => any): RakunAsyncIterator<T>;
    switchIfEmpty(source: RakunAsyncIteratorSource<T>): RakunAsyncIterator<T>;
    defaultIfEmpty(value: T): RakunAsyncIterator<T>;
    onErrorResume<E>(errorType: ErrorConstructor<E>, fn: (value: E) => RakunAsyncIteratorSource<T>): RakunAsyncIterator<T>;
}
export type RakunStaticAsyncIterator = {
    then(): RakunAsyncIterator<typeof Void>;
    empty<T>(): RakunAsyncIterator<T>;
    zip<T extends RakunSource<any>[]>(...monoArray: T): RakunAsyncIterator<ReturnUnzip<T>>;
    just<T>(...promises: Promise<T>[] | T[]): RakunAsyncIterator<T>;
    error<T>(error: any): RakunAsyncIterator<T>;
    fromArray<R>(values: R[] | Promise<R[]>): RakunAsyncIterator<R>;
    fromCallback<T>(...callbacks: RakunContextManagerCallback<T[] | Promise<T[]> | Promise<T>[]>[]): RakunAsyncIterator<T>;
};
