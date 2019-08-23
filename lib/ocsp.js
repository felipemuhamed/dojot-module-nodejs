"use strict";

const openssl = require('openssl-nodejs');
var logger = require("@dojot/dojot-module-logger").logger;

const TAG = { filename: "ocsp" };

class OCSPRequester {

    /**
     * Constructor
     *
     */
    constructor() {
        this.result = null;
        this.entity = null;
    }

    /**
    * Send a request to the OCSP service and verify if the cert is authorized
    *
    * @param  {string} url        OCSP url
    * @param  {string} mycert     entity raw data cert
    * @param  {string} cacert     CA directory cert
    * @param  {string} cn         entity CN
    *
    * @return {Promise}           True if the is cert authorized, else False
    */
    sendRequest(url, mycert, cacert, cn) {

        return new Promise((resolve, reject) => {

            let cert = "-----BEGIN CERTIFICATE-----" + "\n"
                + mycert +
                "\n" + "-----END CERTIFICATE-----";

            let bufferedData = { name: 'data.crt', buffer: Buffer.from(cert, 'ascii') };

            if (!url || !mycert || !cacert || !cn) {
                logger.warn("Parameters error", TAG);
                reject("Parameters error");
            }

            logger.debug(`Buffered data for the cert with entity ${cn}`, TAG);

            openssl(['ocsp', '-issuer', cacert, '-cert',
                bufferedData, '-url', url],
                (err, buffer) => {

                    logger.debug("Parsing incoming OCSP response..", TAG);

                    let bufferString = buffer.toString();

                    logger.debug(`Stream data ${bufferString}.`, TAG);

                    this.result = bufferString.split('\n')[0].split(' ')[1]
                    this.entity = cn;

                    logger.debug(`CN ${this.entity} cert status: ${this.result}`, TAG);


                    if (this.result == "good") {
                        logger.debug("Certificate is good", TAG);
                        return resolve(true);
                    }
                    else {
                        this.result = null;
                        this.entity = null;
                        logger.debug("Certificate is revokated", TAG);
                        return resolve(false);
                    }

                }
            );
        })
    }
}

module.exports = {
    OCSPRequester
}