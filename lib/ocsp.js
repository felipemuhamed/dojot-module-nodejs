"use strict";

const fs = require('fs').promises;
const openssl = require('openssl-nodejs');

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
    * create a .crt file of the client
    *
    * @param  {[string]} clientCert  The raw data of the certificate (must be PEM)
    * @param  {[string]} path        path of the saved file
    *
    * @return {[Promise]}            Saved crt if its all ok, else return the error
    */

    async  _createClientCRT(clientCert, path) {

        /* format the client cert to be used */
        let cert = "-----BEGIN CERTIFICATE-----" + "\n"
            + clientCert +
            "\n" + "-----END CERTIFICATE-----"

        /* save in a path*/
        try {
            return await fs.writeFile(path, cert);
        } catch (e) {
            return e;
        }

    }

    /**
    * Send a request to the OCSP service and verify if the cert is authorized
    *
    * @param  {[string]} url        OCSP url
    * @param  {[string]} mycert     entity raw data cert
    * @param  {[string]} cacert     CA directory cert
    * @param  {[string]} cn         entity CN
    *
    * @return {[Promise]}           True if the is cert authorized, else False
    */
    sendRequest(url, mycert, cacert, cn, clientPath) {
        return new Promise((resolve, reject) => {

            this._createClientCRT(mycert, clientPath).then(() => {
                openssl(['ocsp', '-issuer', cacert, '-cert',
                    clientPath, '-url', url],
                    (err, buffer) => {

                        let bufferString = buffer.toString();
                        console.log(bufferString);
                        let FirstLine = bufferString.split('\n')[0]
                        let statusCert = FirstLine.split(' ')[1]
                        this.result = statusCert;
                        this.entity = cn;

                        if (this.result == "good") {
                            this.result = null;
                            this.entity = null;
                            return resolve(true);
                        }
                        else {
                            this.result = null;
                            this.entity = null;
                            return reject(false);
                        }

                    }
                );
            }).catch(() => {
                return reject(false);
            })
        });

    }
}

module.exports = {
    OCSPRequester
}