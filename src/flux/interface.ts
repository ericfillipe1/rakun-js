
import { RakunContextManager } from "../context/interface";
import { RakunMono } from "../mono";
import { ErrorConstructor, RakunIteratorSource, ReturnUnzipWhen, UnpackArrayType } from "../types";
import { Void, WrappedValue_OPAQUE } from "../wrapped";


export type RakunStaticFlux = {
    just<T extends any[]>(...monoArray: T): RakunFlux<UnpackArrayType<T>>
    fromArray<R>(value: R[]): RakunFlux<R>
}
export interface RakunFlux<T> extends RakunIteratorSource<T> {
    readonly [WrappedValue_OPAQUE]: 'flux'
    then<Source extends RakunMono<any> | RakunFlux<any>>(source: Source): Source;
    then(): RakunMono<typeof Void>
    zipWhen<R extends ((value: T) => (RakunMono<any> | RakunFlux<any>))[]>(...monoArrayFn: R): RakunFlux<[T, ...ReturnUnzipWhen<R>]>
    pipe<R>(fn: (value: T) => R): RakunFlux<R>
    filter(fn: (value: T) => boolean): RakunFlux<T>
    flatFilter(fn: (value: T) => (RakunMono<boolean> | RakunFlux<boolean>)): RakunFlux<T>
    flatPipe<R>(fn: (value: T) => (RakunMono<R> | RakunFlux<R>)): RakunFlux<R>
    array(): RakunMono<T[]>
    doOnNext(handler: (value: T) => any): RakunFlux<T>
    doOnError(handler: (error: any) => any): RakunFlux<T>
    onErrorResume<E>(errorType: ErrorConstructor<E>, fn: (value: E) => (RakunMono<T> | RakunFlux<T>)): RakunFlux<T>
    switchIfEmpty(source: (RakunMono<any> | RakunFlux<any>)): RakunFlux<T>
    defaultIfEmpty(value: T): RakunFlux<T>
    blockFirst(contextManager?: RakunContextManager): Promise<T> | T | null
    block(contextManager?: RakunContextManager): Promise<T[]> | T[]

} 