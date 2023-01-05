import { RakunContextManager } from "../context/interface"
import { ErrorConstructor } from "../types"
import { Void, WrappedValue_OPAQUE } from "../wrapped"


export type ReturnUnzip<T> = { [K in keyof T]: T[K] extends RakunIterator<infer R> ? R : never }
export type ReturnUnzipWhen<T> = { [K in keyof T]: T[K] extends (value: any) => RakunIterator<infer R> ? R : never }






export interface RakunIterator<T> {

    iterator(ctx: RakunContextManager): Iterator<T>
    block(contextManager: RakunContextManager): T[]
    blockFirst(contextManager: RakunContextManager): T
    readonly [WrappedValue_OPAQUE]: 'iterator'


    iterator(ctx: RakunContextManager): Iterator<T>
    flatFilter(fn: (value: T) => RakunIterator<boolean>): RakunIterator<T>
    filter(fn: (value: T) => boolean): RakunIterator<T>
    thenReturn<R>(value: R): RakunIterator<R>
    then<R>(source: RakunIterator<R>): RakunIterator<R>
    then(): RakunIterator<typeof Void>
    zip<R extends RakunIterator<any>[]>(...monoArray: R): RakunIterator<[T, ...ReturnUnzip<R>]>
    zipWhen<R extends ((value: T) => RakunIterator<any>)[]>(...monoArrayFn: R): RakunIterator<[T, ...ReturnUnzipWhen<R>]>
    pipe<R>(fn: (value: T) => R): RakunIterator<R>
    flatPipe<R>(fn: (value: T) => RakunIterator<R>): RakunIterator<R>
    doOnNext(handler: (value: T) => any): RakunIterator<T>
    doOnError(handler: (error: any) => any): RakunIterator<T>
    switchIfEmpty(source: RakunIterator<T>): RakunIterator<T>
    defaultIfEmpty(value: T): RakunIterator<T>
    onErrorResume<E>(errorType: ErrorConstructor<E>, fn: (value: E) => RakunIterator<T>): RakunIterator<T>
}



export type RakunStaticIterator = {
    then(): RakunIterator<typeof Void>
    empty<T>(): RakunIterator<T>
    zip<T extends RakunIterator<any>[]>(...monoArray: T): RakunIterator<ReturnUnzip<T>>
    just<T>(...promises: T[]): RakunIterator<T>
    error<T>(error: any): RakunIterator<T>
    fromArray<R>(values: R[]): RakunIterator<R>
    fromCallback<T>(...callbacks: { (contextManager: RakunContextManager): T[] }[]): RakunIterator<T>
}

