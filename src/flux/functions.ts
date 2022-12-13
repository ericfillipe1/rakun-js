
import { RakunSourceBuild } from "../sourceBuild";
import { RakunFluxImpl } from "./impl";
import { RakunFlux } from "./interface";


export const fromSourceBuild = <T>(sourceBuild: RakunSourceBuild<T>): RakunFlux<T> => {
    return new RakunFluxImpl<T>(sourceBuild);
}