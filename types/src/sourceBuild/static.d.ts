import { Void } from "../wrapped";
import { RakunSourceBuild, RakunSource, RakunStaticSourceBuild, ReturnUnzip, RakunCallback } from "./interface";
export declare class StaticSourceBuildImpl implements RakunStaticSourceBuild {
    fromCallback<R>(...callbacks: RakunCallback<R>[]): RakunSourceBuild<R>;
    just<T>(...promises: Promise<T>[] | T[]): RakunSourceBuild<T>;
    fromArray<R>(values: R[] | Promise<R[]>): RakunSourceBuild<R>;
    returnVoid(): RakunSourceBuild<Void>;
    empty<T>(): RakunSourceBuild<T>;
    zip<R extends RakunSource<any>[]>(...sources: R): RakunSourceBuild<[...ReturnUnzip<R>]>;
    error<T>(error: any): RakunSourceBuild<T>;
}
export declare const sourceBuild: RakunStaticSourceBuild;
