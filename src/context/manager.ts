import { Void, VoidValue } from "../wrapped";
import { RakunContext, RakunContextManager } from "./interface";

export class RakunContextManagerImpl implements RakunContextManager {
    items: { context: RakunContext<any>, value: any }[] = []
    getValue<R>(context: RakunContext<R>): Promise<R> {
        return Promise.resolve(this.items.filter(item => item.context === context)[0]?.value)
    }
    setValue<R>(context: RakunContext<R>, value: R): Promise<Void> {
        this.items = [
            ...this.items
                .filter(item => item.context != context),
            {
                context: context,
                value: value
            }
        ]
        return Promise.resolve(VoidValue);
    }

}
