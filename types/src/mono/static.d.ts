import { RakunCallback, RakunSourceBuild, ReturnUnzip } from "../sourceBuild";
import { Void } from "../wrapped";
import { RakunMono, RakunStaticMono } from "./interface";
export declare class StaticMonoImpl implements RakunStaticMono {
    fromCallBack<T>(...callbacks: RakunCallback<T>[]): RakunMono<T>;
    fromSourceBuild<T>(p: RakunSourceBuild<T>): RakunMono<T>;
    then(): RakunMono<typeof Void>;
    empty<T>(): RakunMono<T>;
    zip<T extends RakunMono<any>[]>(...monoArray: T): RakunMono<ReturnUnzip<T>>;
    just<T>(value: T): RakunMono<T>;
    fromPromise<T>(promise: Promise<T>): RakunMono<T>;
    error<T>(error: any): RakunMono<T>;
}
export declare const mono: RakunStaticMono;
