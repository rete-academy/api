'use strict';

const log = require('library/logger');
const File = require('mongo/model/file');
// const User = require('mongo/model/user');
// const config = require('config');

const {
    // checkRole,
    filterFiles,
    defaultResponse,
} = require('library/utils');

const invalidRequest = function(req, res) {
    defaultResponse(req, res, 405);
};

const findAll = async function(req, res) {
    try {
        log.verbose('Start finding all file');
        const allFiles = await File.findAll(req.query);
        defaultResponse(req, res, 200, filterFiles(req.user, allFiles));
    } catch (error) { 
        log.error(`${error.name}: ${error.message}`);
        defaultResponse(req, res, error.httpStatusCode, error.message);
    }
};

const uploadSingle = async function(req, res) {
    try {
        if (req.file && req.user) {
            // the uploadToS3 will attach the result into req.file
            const value = {
                data: req.file,
                status: 'public',
                author: req.user._id,
            };
            const newFile = await File.createNew(value);
            defaultResponse(req, res, 200, newFile);
        }
    } catch (error) {
        log.error(`${error.name}: ${error.message}`);
        defaultResponse(req, res, error.httpStatusCode, error.message);
    }
};

module.exports = {
    invalidRequest,
    findAll,
    uploadSingle,
};

