
import { RakunContextManager } from "../context/interface"
import { RakunFlux } from "../flux"
import { RakunIterator } from "../iterator"
import { ErrorConstructor, RakunIteratorSource, ReturnUnzip, ReturnUnzipWhen } from "../types"
import { Void, WrappedValue_OPAQUE } from "../wrapped"

export interface RakunMono<T> extends RakunIteratorSource<T> {
    readonly [WrappedValue_OPAQUE]: 'mono'
    zip<R extends RakunMono<any>[]>(...monoArray: R): RakunMono<[T, ...ReturnUnzip<R>]>
    zipWhen<R extends ((value: T) => (RakunMono<any> | RakunFlux<any>))[]>(...monoArrayFn: R): RakunMono<[T, ...ReturnUnzipWhen<R>]>
    pipe<R>(fn: (value: T) => R): RakunMono<R>
    flatPipe<R>(fn: (value: T) => (RakunMono<R> | RakunFlux<R>)): RakunMono<R>
    flatPipeMany<R>(fn: (value: T) => (RakunMono<R> | RakunFlux<R>)): RakunFlux<R>
    thenReturn<R>(value: R): RakunMono<R>
    then<Source extends RakunMono<any> | RakunFlux<any>>(source: Source): Source;
    then(): RakunMono<typeof Void>
    filter(fn: (value: T) => boolean): RakunMono<T>
    flatFilter(fn: (value: T) => (RakunMono<boolean> | RakunFlux<boolean>)): RakunMono<T>
    doOnNext(handler: (value: T) => any): RakunMono<T>
    doOnError(handler: (error: any) => any): RakunMono<T>
    onErrorResume<E>(errorType: ErrorConstructor<E>, fn: (value: E) => (RakunMono<T> | RakunFlux<T>)): RakunMono<T>
    switchIfEmpty(source: (RakunMono<T> | RakunFlux<T>)): RakunMono<T>
    defaultIfEmpty(value: T): RakunMono<T>
    blockFirst(contextManager?: RakunContextManager): Promise<T> | T | null
    block(contextManager?: RakunContextManager): Promise<T[]> | T[]
    iterator: RakunIterator<T>

}

export type RakunStaticMono = {
    zip<T extends RakunMono<any>[]>(monoArray: T): RakunMono<ReturnUnzip<T>>;
    just<T>(value: T): RakunMono<T>;
    fromIterator<T>(iterable: RakunIterator<T>): RakunMono<T>;
    then(): RakunMono<typeof Void>;
    empty<T>(): RakunMono<T>;
    error<T>(error: any): RakunMono<T>;
}

