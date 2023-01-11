import { StaticIteratorImpl } from "./impl";
import { RakunStaticIterator } from "./interface";
const iterator: RakunStaticIterator = new StaticIteratorImpl();
export * from "./interface";
export default iterator;