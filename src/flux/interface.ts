
import { RakunContextManager } from "../context/interface";
import { RakunMono } from "../mono";
import { RakunSourceBuild, RakunSource, ReturnUnzipWhen } from "../sourceBuild/interface";
import { ErrorConstructor, UnpackArrayType } from "../types";
import { WrappedValue_OPAQUE } from "../wrapped";


export type RakunStaticFlux = {
    fromArray<R>(value: R[]): RakunFlux<R>
    fromPromise<T>(promise: Promise<T[]>): RakunFlux<T>
    fromSourceBuild<T>(source: RakunSourceBuild<T>): RakunFlux<T>;
    just<T extends any[]>(...monoArray: T): RakunFlux<UnpackArrayType<T>>
}
export interface RakunFlux<T> extends RakunSource<T> {
    readonly [WrappedValue_OPAQUE]: 'flux'
    sourceBuild: RakunSourceBuild<T>
    zipWhen<R extends ((value: T) => RakunMono<any>)[]>(...monoArrayFn: R): RakunFlux<[T, ...ReturnUnzipWhen<R>]>
    pipe<R>(fn: (value: T) => R): RakunFlux<R>
    filter(fn: (value: T) => boolean): RakunFlux<T>
    flatFilter(fn: (value: T) => RakunMono<boolean>): RakunFlux<T>
    flatPipe<R>(fn: (value: T) => RakunSource<R>): RakunFlux<R>
    array(): RakunMono<T[]>
    block(contextManager?: RakunContextManager): Promise<T[]>
    blockFirst(contextManager?: RakunContextManager): Promise<T>
    doOnNext(handler: (value: T) => any): RakunFlux<T>
    doOnError(handler: (error: any) => any): RakunFlux<T>
    onErrorResume<E>(errorType: ErrorConstructor<E>, fn: (value: E) => RakunMono<T>): RakunFlux<T>


    switchIfEmpty(source: RakunSource<T>): RakunFlux<T>
    defaultIfEmpty(value: T): RakunFlux<T>
}