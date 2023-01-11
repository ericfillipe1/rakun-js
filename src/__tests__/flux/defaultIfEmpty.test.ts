import flux from "../../flux";

describe('defaultIfEmpty', () => {
    test('test success', () => {
        const result = flux.just("1", 2, "3")
            .filter(item => item == 20)
            .defaultIfEmpty(54)
            .block();
        expect(result).toStrictEqual([54]);
    });

});