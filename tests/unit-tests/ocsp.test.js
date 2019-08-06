

/* OCSP module tests*/
describe("Testing OCSP module", () => {
    beforeEach(() => jest.resetModules());

    describe("When an OCSP request was sent", () => {
        it('returns true if cert is good', async () => {

            jest.mock('openssl-nodejs', () =>
                (args, callback) =>
                    callback("error", "../certs/5ef927.crt: good\nThis Update: Jul 27 23:28:19 2019 GMT"));

            const OCSPRequester = require('../../lib/ocsp.js');
            OCSPRequester._createClientCRT = jest.fn();

            const ocsp = new OCSPRequester.OCSPRequester();

            const result = await ocsp.sendRequest('test', 'test', 'test', 'test');

            expect(result).toBe(true);
        });

    });

    describe("When an OCSP request was sent", () => {
        it('returns false if cert is not good', () => {
            jest.mock('openssl-nodejs', () =>
                (args, callback) =>
                    callback("error", "../certs/5ef927.crt: revoke\nThis Update: Jul 27 23:28:19 2019 GMT"));

            const OCSPRequester = require('../../lib/ocsp.js');

            const ocsp = new OCSPRequester.OCSPRequester();

            ocsp.sendRequest('test', 'test', 'test', 'test').then((e) => {
                expect(e).toBe(false);

            });

        });

    });

    describe("When an OCSP request was sent", () => {
        it('returns Parameters error if cant read correctly the input', () => {

            const OCSPRequester = require('../../lib/ocsp.js');

            const ocsp = new OCSPRequester.OCSPRequester();

            ocsp.sendRequest('test', 'test').catch((e) => {
                expect(e).toBe("Parameters error");

            });

        });

    });

})