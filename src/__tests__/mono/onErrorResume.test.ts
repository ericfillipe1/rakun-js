
import mono from "../../mono";

describe('mono onErrorResume', () => {

    class MyError extends Error {


    }

    test('test errorResume', async () => {

        const error = new MyError();
        let errorReturn = null;
        let value = null;
        const result = await mono.just(1)
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
            .blockFirst()
        const expectValue = "error"

        expect(result).toStrictEqual(expectValue);
        expect(value).toStrictEqual(1);
        expect(errorReturn).toStrictEqual(error);
    });

});