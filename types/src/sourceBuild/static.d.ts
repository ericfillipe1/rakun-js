import { Void } from "../wrapped";
import { RakunSourceBuild, RakunSource, RakunStaticSourceBuild, ReturnUnzip } from "./interface";
export declare class StaticSourceBuildImpl implements RakunStaticSourceBuild {
    fromCallback: <T>(...callbacks: import("./interface").RakunCallback<T[] | Promise<T[]> | Promise<T>[]>[]) => RakunSourceBuild<T>;
    just<T>(...promises: Promise<T>[] | T[]): RakunSourceBuild<T>;
    fromArray<R>(values: R[] | Promise<R[]>): RakunSourceBuild<R>;
    then(): RakunSourceBuild<typeof Void>;
    empty<T>(): RakunSourceBuild<T>;
    zip<R extends RakunSource<any>[]>(...sources: R): RakunSourceBuild<[...ReturnUnzip<R>]>;
    error<T>(error: any): RakunSourceBuild<T>;
}
export declare const sourceBuild: RakunStaticSourceBuild;
