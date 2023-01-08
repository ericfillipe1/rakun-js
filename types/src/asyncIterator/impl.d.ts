import { RakunContextManager } from "../context/interface";
import { ErrorConstructor, RakunAsyncIteratorSource, RakunContextManagerCallback, RakunSource } from "../types";
import { Void, WrappedValue_OPAQUE } from "../wrapped";
import { RakunAsyncIterator, RakunStaticAsyncIterator, ReturnUnzip, ReturnUnzipWhen } from "./interface";
export declare class RakunAsyncIteratorImpl<T> implements RakunAsyncIterator<T> {
    private callback;
    constructor(callback: RakunContextManagerCallback<AsyncIterable<T>>);
    [WrappedValue_OPAQUE]: "asyncIterator";
    switchIfEmpty(source: RakunAsyncIterator<T>): RakunAsyncIterator<T>;
    defaultIfEmpty(value: T): RakunAsyncIterator<T>;
    zip<R extends RakunAsyncIteratorSource<any>[]>(...sources: R): RakunAsyncIterator<[T, ...ReturnUnzip<R>]>;
    zipWhen<R extends ((value: T) => RakunAsyncIteratorSource<any>)[]>(...sourceFns: R): RakunAsyncIterator<[T, ...ReturnUnzipWhen<R>]>;
    flatFilter(fn: (value: T) => RakunAsyncIterator<boolean>): RakunAsyncIterator<T>;
    filter(fn: (value: T) => boolean): RakunAsyncIterator<T>;
    thenReturn<R>(value: R): RakunAsyncIterator<R>;
    then<R>(source?: RakunAsyncIteratorSource<R>): RakunAsyncIterator<R> | RakunAsyncIterator<typeof Void>;
    onErrorResume<E>(errorType: ErrorConstructor<E>, fn: (value: E) => RakunAsyncIterator<T>): RakunAsyncIterator<T>;
    doOnNext(handler: (value: T) => any): RakunAsyncIterator<T>;
    doOnError(handler: (error: any) => any): RakunAsyncIterator<T>;
    pipe<R>(fn: (value: T) => R | Promise<R>): RakunAsyncIterator<R>;
    flatPipe<R>(fn: (value: T) => RakunAsyncIterator<R>): RakunAsyncIterator<R>;
    blockFirst(contextManager: RakunContextManager): Promise<T>;
    block(contextManager: RakunContextManager): Promise<T[]>;
    iterator(ctx: RakunContextManager): AsyncIterator<T>;
}
export declare class StaticAsyncIteratorImpl implements RakunStaticAsyncIterator {
    then: () => RakunAsyncIterator<typeof Void>;
    empty: <T>() => RakunAsyncIterator<T>;
    zip: <R extends RakunSource<any>[]>(...sources: R) => RakunAsyncIterator<[...ReturnUnzip<R>]>;
    just: <T>(...promises: Promise<T>[] | T[]) => RakunAsyncIterator<T>;
    error: <T>(error: any) => RakunAsyncIterator<T>;
    fromArray: <R>(values: R[] | Promise<R[]>) => RakunAsyncIterator<R>;
    fromCallback: <T>(...callbacks: RakunContextManagerCallback<T[] | Promise<T[]> | Promise<T>[]>[]) => RakunAsyncIterator<T>;
}
