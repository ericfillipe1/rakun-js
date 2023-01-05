import { StaticAsyncIteratorImpl } from "./impl";
import { RakunStaticAsyncIterator } from "./interface";
const asyncIterator: RakunStaticAsyncIterator = new StaticAsyncIteratorImpl();
export * from "./interface";
export default asyncIterator;