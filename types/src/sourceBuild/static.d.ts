import { Void } from "../wrapped";
import { RakunAsyncIterator, RakunSource, RakunStaticSourceBuild, ReturnUnzip } from "./interface";
export declare class StaticSourceBuildImpl implements RakunStaticSourceBuild {
    fromCallback: <T>(...callbacks: import("./interface").RakunCallback<T[] | Promise<T[]> | Promise<T>[]>[]) => RakunAsyncIterator<T>;
    just<T>(...promises: Promise<T>[] | T[]): RakunAsyncIterator<T>;
    fromArray<R>(values: R[] | Promise<R[]>): RakunAsyncIterator<R>;
    then(): RakunAsyncIterator<typeof Void>;
    empty<T>(): RakunAsyncIterator<T>;
    zip<R extends RakunSource<any>[]>(...sources: R): RakunAsyncIterator<[...ReturnUnzip<R>]>;
    error<T>(error: any): RakunAsyncIterator<T>;
}
export declare const sourceBuild: RakunStaticSourceBuild;
