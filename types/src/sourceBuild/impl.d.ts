import { RakunContextManager } from "../context/interface";
import { ErrorConstructor } from "../types";
import { Void, WrappedValue_OPAQUE } from "../wrapped";
import { RakunCallback, RakunAsyncIterator, RakunSource, ReturnUnzip, ReturnUnzipWhen } from "./interface";
export declare const fromAsyncIterator: <T>(execute: RakunCallback<AsyncIterable<T>>) => RakunAsyncIterator<T>;
export declare const resolveArray: <T>(array: T | T[]) => T[];
export declare const fromCallback: <T>(...callbacks: RakunCallback<T[] | Promise<T[]> | Promise<T>[]>[]) => RakunAsyncIterator<T>;
export declare class RakunAsyncIteratorImpl<T> implements RakunAsyncIterator<T> {
    private calback;
    constructor(calback: RakunCallback<AsyncIterable<T>>);
    [WrappedValue_OPAQUE]: string;
    switchIfEmpty(source: RakunSource<T>): RakunAsyncIterator<T>;
    defaultIfEmpty(value: T): RakunAsyncIterator<T>;
    zip<R extends RakunSource<any>[]>(...sources: R): RakunAsyncIterator<[T, ...ReturnUnzip<R>]>;
    zipWhen<R extends ((value: T) => RakunSource<any>)[]>(...sourceFns: R): RakunAsyncIterator<[T, ...ReturnUnzipWhen<R>]>;
    flatFilter(fn: (value: T) => RakunSource<boolean>): RakunAsyncIterator<T>;
    filter(fn: (value: T) => boolean): RakunAsyncIterator<T>;
    thenReturn<R>(value: R): RakunAsyncIterator<R>;
    then<R>(source?: RakunSource<R>): RakunAsyncIterator<R> | RakunAsyncIterator<typeof Void>;
    onErrorResume<E>(errorType: ErrorConstructor<E>, fn: (value: E) => RakunAsyncIterator<T>): RakunAsyncIterator<T>;
    doOnNext(handler: (value: T) => any): RakunAsyncIterator<T>;
    doOnError(handler: (error: any) => any): RakunAsyncIterator<T>;
    pipe<R>(fn: (value: T) => R | Promise<R>): RakunAsyncIterator<R>;
    flatPipe<R>(fn: (value: T) => RakunAsyncIterator<R>): RakunAsyncIterator<R>;
    blockFirst(contextManager: RakunContextManager): Promise<T>;
    block(contextManager: RakunContextManager): Promise<T[]>;
    asyncIterator(ctx: RakunContextManager): AsyncIterator<T>;
}
