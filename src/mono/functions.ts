
import { RakunSourceBuild } from "../sourceBuild";
import { RakunMonoImpl } from "./impl";
import { RakunMono } from "./interface";


export const fromSourceBuild = <T>(sourceBuild: RakunSourceBuild<T>): RakunMono<T> => {
    return new RakunMonoImpl(sourceBuild);
}