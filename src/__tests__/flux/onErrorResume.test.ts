import flux from "../../flux";
import mono from "../../mono";

describe('flux onErrorResume', () => {

    class MyError extends Error {


    }

    test('test onErrorResume', async () => {
        const error = new MyError();
        let errorReturn = null;
        let value = null;
        const result = await flux.just(1, 2, 3)
            .doOnNext((v) => {
                value = v
            })
            .pipe((v) => {
                if (true) {
                    throw error
                }
                return `${v}`
            })
            .doOnError((e) => {
                errorReturn = e
            })
            .onErrorResume(MyError, () => {
                return mono.just("error");
            })
            .block()
        const expectValue = ["error", "error", "error"]

        expect(result).toStrictEqual(expectValue);
        expect(value).toStrictEqual(3);
        expect(errorReturn).toStrictEqual(error);
    });

});