import { RakunStaticFluxImpl } from "./impl";
import { RakunStaticFlux } from "./interface";
export * from "./interface";
const flux: RakunStaticFlux = new RakunStaticFluxImpl();
export default flux;