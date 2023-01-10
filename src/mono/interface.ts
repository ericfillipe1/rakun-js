import { RakunContextManager } from "../context/interface"
import { RakunFlux } from "../flux"
import { RakunAsyncIterator, ReturnUnzip, ReturnUnzipWhen } from "../asyncIterator/interface"
import { ErrorConstructor, RakunContextManagerCallback, RakunExec, RakunSource } from "../types"
import { Void, WrappedValue_OPAQUE } from "../wrapped"
export interface RakunMono<T> {
    readonly [WrappedValue_OPAQUE]: 'mono'
    zip<R extends RakunMono<any>[]>(...monoArray: R): RakunMono<[T, ...ReturnUnzip<R>]>
    zipWhen<R extends ((value: T) => RakunSource<any>)[]>(...monoArrayFn: R): RakunMono<[T, ...ReturnUnzipWhen<R>]>
    pipe<R>(fn: (value: T) => R): RakunMono<R>
    flatPipe<R>(fn: (value: T) => RakunSource<R>): RakunMono<R>
    flatPipeMany<R>(fn: (value: T) => RakunSource<R>): RakunFlux<R>
    thenReturn<R>(value: R): RakunMono<R>
    then<Source extends RakunMono<any> | RakunFlux<any>>(source: Source): Source;
    then(): RakunMono<typeof Void>
    filter(fn: (value: T) => boolean): RakunMono<T>
    flatFilter(fn: (value: T) => RakunSource<boolean>): RakunMono<T>
    doOnNext(handler: (value: T) => any): RakunMono<T>
    doOnError(handler: (error: any) => any): RakunMono<T>
    onErrorResume<E>(errorType: ErrorConstructor<E>, fn: (value: E) => RakunSource<T>): RakunMono<T>
    switchIfEmpty(source: RakunSource<T>): RakunMono<T>
    defaultIfEmpty(value: T): RakunMono<T>
    exec(ctx: RakunContextManager): AsyncIterable<T> | Iterable<T>
    blockFirst(contextManager?: RakunContextManager): Promise<T> | T
    block(contextManager?: RakunContextManager): Promise<T[]> | T[]

}

export type RakunStaticMono = {
    fromPromiseCallback<T>(callback: RakunContextManagerCallback<Promise<T>[]>): RakunMono<T>
    zip<T extends RakunMono<any>[]>(...monoArray: T): RakunMono<ReturnUnzip<T>>;
    just<T>(value: T): RakunMono<T>;
    fromAsyncIterator<T>(asyncIterator: RakunAsyncIterator<T>): RakunMono<T>;
    fromExecute<T>(execute: RakunExec<T>): RakunMono<T>
    then(): RakunMono<typeof Void>;
    empty<T>(): RakunMono<T>;
    error<T>(error: any): RakunMono<T>;
}

