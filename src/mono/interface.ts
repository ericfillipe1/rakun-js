import { RakunContextManager } from "../context/interface"
import { RakunSourceBuild, RakunSource, ReturnUnzip, ReturnUnzipWhen, RakunCallback } from "../sourceBuild/interface"
import { ErrorConstructor } from "../types"
import { Void, WrappedValue_OPAQUE } from "../wrapped"
export interface RakunMono<T> extends RakunSource<T> {
    readonly [WrappedValue_OPAQUE]: 'mono'
    sourceBuild: RakunSourceBuild<T>
    zip<R extends RakunMono<any>[]>(...monoArray: R): RakunMono<[T, ...ReturnUnzip<R>]>
    zipWhen<R extends ((value: T) => RakunMono<any>)[]>(...monoArrayFn: R): RakunMono<[T, ...ReturnUnzipWhen<R>]>
    pipe<R>(fn: (value: T) => R): RakunMono<R>
    flatPipe<R>(fn: (value: T) => RakunMono<R>): RakunMono<R>
    thenReturn<R>(value: R): RakunMono<R>
    then<R>(source: RakunSource<R>): RakunMono<R>
    then(): RakunMono<Void>
    filter(fn: (value: T) => boolean): RakunMono<T>
    flatFilter(fn: (value: T) => RakunMono<boolean>): RakunMono<T>
    blockFirst(contextManager?: RakunContextManager): Promise<T>
    doOnNext(handler: (value: T) => any): RakunMono<T>
    doOnError(handler: (error: any) => any): RakunMono<T>
    onErrorResume<E>(errorType: ErrorConstructor<E>, fn: (value: E) => RakunMono<T>): RakunMono<T>
    switchIfEmpty(source: RakunSource<T>): RakunMono<T>
    defaultIfEmpty(value: T): RakunMono<T>
}


export type RakunStaticMono = {

    zip<T extends RakunMono<any>[]>(...monoArray: T): RakunMono<ReturnUnzip<T>>;
    just<T>(value: T): RakunMono<T>;
    fromSourceBuild<T>(sourceBuild: RakunSourceBuild<T>): RakunMono<T>;
    fromPromise<T>(promise: Promise<T>): RakunMono<T>;
    fromCallBack<T>(...callbacks: RakunCallback<T>[]): RakunMono<T>;
    returnVoid(): RakunMono<Void>;
    empty<T>(): RakunMono<T>;
    error<T>(error: any): RakunMono<T>;

}

