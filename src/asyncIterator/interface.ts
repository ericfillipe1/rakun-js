import { RakunContextManager } from "../context/interface"
import { ErrorConstructor, RakunContextManagerCallback, RakunExec, RakunSource } from "../types"
import { Void, WrappedValue_OPAQUE } from "../wrapped"



export type ReturnUnzip<T> = { [K in keyof T]: T[K] extends RakunAsyncIterator<infer R> ? R : never }
export type ReturnUnzipWhen<T> = { [K in keyof T]: T[K] extends (value: any) => RakunAsyncIterator<infer R> ? R : never }




export interface RakunAsyncIterator<T> {
    array(): RakunAsyncIterator<T[]>
    exec(ctx: RakunContextManager): AsyncIterable<T> | Iterable<T>
    blockFirst(contextManager: RakunContextManager): Promise<T> | T
    block(contextManager: RakunContextManager): Promise<T[]> | T[]

    readonly [WrappedValue_OPAQUE]: 'asyncIterator'

    flatFilter(fn: (value: T) => RakunSource<boolean>): RakunAsyncIterator<T>
    filter(fn: (value: T) => boolean): RakunAsyncIterator<T>
    thenReturn<R>(value: R): RakunAsyncIterator<R>
    then<R>(source: RakunSource<R>): RakunAsyncIterator<R>
    then(): RakunAsyncIterator<typeof Void>
    zip<R extends RakunSource<any>[]>(...monoArray: R): RakunAsyncIterator<[T, ...ReturnUnzip<R>]>
    zipWhen<R extends ((value: T) => RakunSource<any>)[]>(...monoArrayFn: R): RakunAsyncIterator<[T, ...ReturnUnzipWhen<R>]>
    pipe<R>(fn: (value: T) => R): RakunAsyncIterator<R>

    flatPipe<R>(fn: (value: T) => RakunSource<R>): RakunAsyncIterator<R>
    doOnNext(handler: (value: T) => any): RakunAsyncIterator<T>
    doOnError(handler: (error: any) => any): RakunAsyncIterator<T>
    switchIfEmpty(source: RakunSource<T>): RakunAsyncIterator<T>
    defaultIfEmpty(value: T): RakunAsyncIterator<T>
    onErrorResume<E>(errorType: ErrorConstructor<E>, fn: (value: E) => RakunSource<T>): RakunAsyncIterator<T>
}


export type RakunStaticAsyncIterator = {
    fromPromiseCallback<T>(callback: RakunContextManagerCallback<Promise<T>[]>): RakunAsyncIterator<T>
    then(): RakunAsyncIterator<typeof Void>
    empty<T>(): RakunAsyncIterator<T>
    zip<T extends RakunSource<any>[]>(...monoArray: T): RakunAsyncIterator<ReturnUnzip<T>>
    just<T>(...promises: T[]): RakunAsyncIterator<T>
    error<T>(error: any): RakunAsyncIterator<T>
    fromExecute<T>(execute: RakunExec<T>): RakunAsyncIterator<T>
}

