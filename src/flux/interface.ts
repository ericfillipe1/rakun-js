
import { RakunContextManager } from "../context/interface";
import { RakunMono } from "../mono";
import { RakunAsyncIterator, ReturnUnzipWhen } from "../asyncIterator/interface";
import { ErrorConstructor, RakunExec, RakunSource, UnpackArrayType } from "../types";
import { Void, WrappedValue_OPAQUE } from "../wrapped";


export type RakunStaticFlux = {
    fromExecute<T>(execute: RakunExec<T>): RakunFlux<T>
    fromAsyncIterator<T>(asyncIterator: RakunAsyncIterator<T>): RakunFlux<T>;
    just<T extends any[]>(...monoArray: T): RakunFlux<UnpackArrayType<T>>
    fromArray<R>(value: R[]): RakunFlux<R>
}
export type RakunFlux<T> = {
    readonly [WrappedValue_OPAQUE]: 'flux'
    then<Source extends RakunMono<any> | RakunFlux<any>>(source: Source): Source;
    then(): RakunMono<typeof Void>
    zipWhen<R extends ((value: T) => RakunSource<any>)[]>(...monoArrayFn: R): RakunFlux<[T, ...ReturnUnzipWhen<R>]>
    pipe<R>(fn: (value: T) => R): RakunFlux<R>
    filter(fn: (value: T) => boolean): RakunFlux<T>
    flatFilter(fn: (value: T) => RakunSource<boolean>): RakunFlux<T>
    flatPipe<R>(fn: (value: T) => RakunSource<R>): RakunFlux<R>
    array(): RakunMono<T[]>
    doOnNext(handler: (value: T) => any): RakunFlux<T>
    doOnError(handler: (error: any) => any): RakunFlux<T>
    onErrorResume<E>(errorType: ErrorConstructor<E>, fn: (value: E) => RakunSource<T>): RakunFlux<T>
    switchIfEmpty(source: RakunSource<T>): RakunFlux<T>
    defaultIfEmpty(value: T): RakunFlux<T>
    exec(ctx: RakunContextManager): AsyncIterable<T> | Iterable<T>
    blockFirst(contextManager?: RakunContextManager): Promise<T> | T
    block(contextManager?: RakunContextManager): Promise<T[]> | T[]

} 