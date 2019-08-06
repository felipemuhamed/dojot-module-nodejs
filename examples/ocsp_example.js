"use strict";
var logger = require("@dojot/dojot-module-logger").logger;
const OCSPRequester = require('../lib/ocsp.js');

const TAG = { filename: "ocsp_example" };


let mycert = 'insert here your client.crt PEM...';
let cacert = 'insert here your ca.crt directory';
let url = 'insert here the url of your oscp provider\
           (example: http://172.18.0.2:8080/ejbca/publicweb/status/ocsp)...';
let cn = 'insert here the CN of your client...';
let path = 'insert here the path to be saved the client.crt...';

const ocsp = new OCSPRequester.OCSPRequester();

ocsp.sendRequest(url, mycert, cacert, cn, path).then((isAuth) => {
    if (isAuth) {
        /* The client is authorized */
        logger.info('Authorized', TAG);
    }
    else {
        /* The client is not authorized */

        logger.info('Not authorized', TAG);
    }
}).catch((err) => {
    /* Internal error.. maybe some parameters errors*/
    logger.error(err, TAG);
});
