'use strict';

// const fs = require('fs-extra');
// const config = require('config');
const log = require('library/logger');

const Client = require('mongo/model/client');

const {
    authoriseUser,
    defaultResponse,
    promiseRejectWithError,
} = require('library/utils');

module.exports.invalidRequest = function(req, res) {
    defaultResponse(req, res, 405);
};

const filterResponse = function(result) {
    return result;
};

module.exports.findAll = async function(req, res) {
    try {
        const user = await authoriseUser(req, res);
        const clients = await Client.findAll(req.query);
        const result = filterResponse(clients,  user);
        defaultResponse(req, res, 200, result);
    } catch (error) {
        log.error(error.message);
        promiseRejectWithError(req, res, error.httpStatusCode, error.message);
    }
};

