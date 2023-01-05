import { RakunStaticMonoImpl } from "./impl";
import { RakunStaticMono } from "./interface";
export * from "./interface";
const mono: RakunStaticMono = new RakunStaticMonoImpl();
export default mono;