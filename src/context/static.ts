
import { RakunContextImpl } from "./impl";
import { RakunContext, RakunStaticContext } from "./interface";

export class RakunStaticContextImpl implements RakunStaticContext {
    create<T>(value: T): RakunContext<T> {
        return new RakunContextImpl<T>(value);
    }
}

export const context: RakunStaticContext = new RakunStaticContextImpl();
