import flux from "../../flux";
import mono from "../../mono";

describe('flux zipWhen', () => {

    test('test success', () => {
        const result = flux.just(1, 2, 3, "96")
            .zipWhen((r) => mono.just(r + "-test"), (r) => mono.just(r + "56"))
            .pipe(([m1, m2, m3]) => `${m1},${m2},${m3}`)
            .block()
        const expectValue = ["1,1-test,156", "2,2-test,256", "3,3-test,356", "96,96-test,9656"]
        expect(result).resolves.toStrictEqual(expectValue);
    });

});