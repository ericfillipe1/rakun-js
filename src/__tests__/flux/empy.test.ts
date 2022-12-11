import flux from "../../flux";
import mono from "../../mono";

describe('flux zip', () => {

    test('test empty', () => {
        const result = flux.just(1, 2, 3, "96")
            .flatPipe(() => mono.empty<string>())
            .zipWhen((r) => mono.just(r + "-test"), (r) => mono.just(r + "56"))
            .block()
        expect(result).resolves.toStrictEqual([]);
    });

});