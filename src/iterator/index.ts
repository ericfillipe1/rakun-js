import { StaticIteratorImpl } from "./impl";
import { RakunStaticIterator } from "./interface";
export * from "./interface";
const iterator: RakunStaticIterator = new StaticIteratorImpl();
export default iterator;