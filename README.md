# dojot-module

[![Build Status](https://travis-ci.com/giovannicuriel/dojot-module-nodejs.svg?branch=master)](https://travis-ci.com/giovannicuriel/dojot-module-nodejs)
[![CodeFactor](https://www.codefactor.io/repository/github/dojot/dojot-module-nodejs/badge)](https://www.codefactor.io/repository/github/dojot/dojot-module-nodejs)
[![DeepScan grade](https://deepscan.io/api/teams/2690/projects/3914/branches/33256/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=2690&pid=3914&bid=33256)
[![codecov](https://codecov.io/gh/dojot/dojot-module-nodejs/branch/master/graph/badge.svg)](https://codecov.io/gh/dojot/dojot-module-nodejs)

Common library to be used in dojot modules.

## Overview

This library is intended to handle all the necessary operations that a service
needs to perform in order to communicate with other dojot services. These
operations are:

- Sending and receiving messages via Kafka;
- Subscribing to new Kafka topics whenever a new tenant is created;

Thus, the service should only inform the library of which subjects it is
interested in and how the messages should be processed.

## How to install

Installing this package is no different than any other from npm. Just execute:

```bash

npm install @dojot/dojot-module

```

which will install this module in its latest version.

## How to use

Using it is also very easy. All normal operations involve using the Messenger
class, which is responsible for communicating with the message broker (Kafka)
and generating events to any component interested in such messages. Also, it
provides a very simple mechanism of event generation and subscription so that
a library could use it to generate more specific events based on those messages.
More on that later.

The folowing code is an example of a code that simply prints any message that
it receives from a particular subject.


```javascript
"use strict";
var dojot = require("@dojot/dojot-module");
var logger = require("@dojot/dojot-module-logger").logger;

var config = dojot.Config;
var messenger = new dojot.Messenger("dojot-snoop", config);
messenger.init();

// Create a channel using a default subject "device-data"
// These "communication channels" will handle all the tenant processing and
// message receival, so that the service implementation would only set the
// message processing callback (done by 'messenger.on' calls).
//
// Creating a new channel will inform the library that the service is interested
// in read/write messages to a particular subject.
messenger.createChannel(config.dojot.subjects.deviceData, "rw");

// Create a channel using a particular subject "service-status"
messenger.createChannel("service-status", "w");

// Register callback to process incoming device data
messenger.on(config.dojot.subjects.deviceData, "message", (tenant, msg) => {
  logger.info(`Client: Received message in device data subject.`);
  logger.info(`Client: Tenant is: ${tenant}`);
  logger.info(`Client: Message is: ${msg}`);
});

// Publish a message on "service-status" subject using "dojot-management" tenant
messenger.publish("service-status", config.management.tenant, "service X is up");

```



## Configuration

This library might be configured in different ways. Each class (Messenger,
Consumer and Producer) receives a configuration object in its constructor. It
should have the following attributes at least:

```json
{
  "kafka": {
    "producer": {
      "metadata.brokers.list": "kafka:9092",
      "socket.keepalive.enable": true,
      "dr_cb": true
    },
    "consumer": {
      "group.id": "sample-group",
      "metadata.brokers.list": "kafka:9092",
    }
  },
  "databroker": {
    "url": "http://data-broker",
    "timeoutSleep": 2,
    "connectionRetries": 5,
  },
  "auth": {
    "url": "http://auth:5000",
    "timeoutSleep": 5,
    "connectionRetries": 5,
  },
  "deviceManager": {
    "url": "http://device-manager:5000",
    "timeoutSleep": 5,
    "connectionRetries": 3,
  },
  "dojot": {
    "management": {
      "user": "dojot-management",
      "tenant": "dojot-management"
    },
    "subjects": {
      "tenancy": "dojot.tenancy",
      "devices": "dojot.device-manager.device",
      "deviceData": "device-data",
    }
  }
}
```

All these parameters can be found in [config.js](./lib/config.js) file. It is
recommended that the service implementation use this file as basis to configure
other classes.

The Kafka section follows the parameters used by
[node-rdkafka](https://github.com/Blizzard/node-rdkafka) library, which in turn
follows the configuration of
[librdkafka](https://github.com/edenhill/librdkafka). These are the bare
minumum that this library needs in order to operate correctly. All the values
are the default ones, they might be changed depending on deployment scenario.

The config.js file will also get a few environment variables in order to ease
configuration. They are:

```bash
export KAFKA_HOSTS = "kafka:9092"
export KAFKA_GROUP_ID = "dojot-module"
export DATA_BROKER_URL = "http://data-broker"
export AUTH_URL = "http://auth:5000"
export DEVICE_MANAGER_URL = "http://device-manager:5000"
export DOJOT_MANAGEMENT_USER = "dojot-management"
export DOJOT_MANAGEMENT_TENANT = "dojot-management"
export DOJOT_SUBJECT_TENANCY = "dojot.tenancy"
export DOJOT_SUBJECT_DEVICES = "dojot.device-manager.device"
export DOJOT_SUBJECT_DEVICE_DATA = "device-data"
```

## Dojot OCSP Client

This Dojot OCSP client was built-in using the OpenSSL library. the idea of this library is to provide a full client that will make OCSP requests to an OCSP server  in order to check the revocation status of its digital certificate. The use of this dojot OCSP is quite simple, where one only need to pass the provider URL, the one digital certificate, the trusted root CA certificate and the one CN to the OCSP provider. A simple example to understand the use its showed bellow:

```javascript

// Importing the dojot lib
var dojot = require("@dojot/dojot-module");


// Creating the client
const ocsp = new dojot.Ocsp();

// The data to be used in the request
let mycert = 'insert here your client.crt PEM...';
let cacert = 'insert here your ca.crt directory';
let url = 'insert here the url of your oscp provider\
           (example: http://172.18.0.2:8080/ejbca/publicweb/status/ocsp)...';
let cn = 'insert here the CN of your client...';

// here is the called request
ocsp.sendRequest(url, mycert, cacert, cn).then((isAuth) => {
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

```
