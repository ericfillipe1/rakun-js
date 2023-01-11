import { RakunContextManager } from "../context";
import { ErrorConstructor, RakunIteratorSource, RakunNextResult, ReturnUnzip, ReturnUnzipWhen } from "../types";
import { Void } from "../wrapped";



export interface RakunIterator<T> extends RakunIteratorSource<T> {
    next(ctx: RakunContextManager): RakunNextResult<T>
    array(): RakunIterator<T[]>
    block(contextManager: RakunContextManager): T[] | Promise<T[]>
    blockFirst(contextManager: RakunContextManager): T | Promise<T> | null
    switchIfEmpty(source: RakunIteratorSource<T>): RakunIterator<T>
    defaultIfEmpty(value: T): RakunIterator<T>
    flatPipe<R>(fn: (value: T) => RakunIteratorSource<R>): RakunIterator<R>
    pipe<R>(fn: (value: T) => R): RakunIterator<R>
    flatFilter(fn: (value: T) => RakunIteratorSource<boolean>): RakunIterator<T>
    filter(fn: (value: T) => boolean): RakunIterator<T>
    thenReturn<R>(value: R): RakunIterator<R>
    then<R>(source: RakunIteratorSource<R>): RakunIterator<R>
    then(): RakunIterator<typeof Void>
    zip<R extends RakunIteratorSource<any>[]>(...monoArray: R): RakunIterator<[T, ...ReturnUnzip<R>]>
    zipWhen<R extends ((value: T) => RakunIteratorSource<any>)[]>(...monoArrayFn: R): RakunIterator<[T, ...ReturnUnzipWhen<R>]>
    doOnNext(handler: (value: T) => any): RakunIterator<T>
    doOnError(handler: (error: any) => any): RakunIterator<T>
    onErrorResume<E>(errorType: ErrorConstructor<E>, fn: (value: E) => RakunIteratorSource<T>): RakunIterator<T>
}



export interface RakunStaticIterator {
    error<T>(error: any): RakunIterator<T>;
    zip<R extends RakunIteratorSource<any>[]>(iterables: R): RakunIterator<[...ReturnUnzip<R>]>;
    fromArray<T>(values: T[]): RakunIterator<T>
    then(): RakunIterator<typeof Void>
    empty<T>(): RakunIterator<T>
    just<T>(...values: T[]): RakunIterator<T>
    fromPromise<T>(promise: Promise<T>): RakunIterator<T>
}
