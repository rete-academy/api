'use strict';

const log = require('library/logger');
const File = require('mongo/model/file');
// const User = require('mongo/model/user');
// const config = require('config');

const {
    // checkRole,
    defaultResponse,
} = require('library/utils');

const invalidRequest = function(req, res) {
    defaultResponse(req, res, 405);
};

const uploadSingle = async function(req, res) {
    try {
        if (req.file && req.user) {
            // the uploadToS3 will attach the result into req.file
            // We should read the file details and spread it before create
            const newFile = await File.createNew(req.file);
            defaultResponse(req, res, 200, newFile);
        }
    } catch (error) {
        log.error(`${error.name}: ${error.message}`);
        defaultResponse(req, res, error.httpStatusCode, error.message);
    }
};

module.exports = {
    invalidRequest,
    uploadSingle,
};

