'use strict';

const log = require('library/logger');
const File = require('mongo/model/file');
const { deleteFromS3 } = require('library/aws');
// const User = require('mongo/model/user');
// const config = require('config');

const {
    checkRole,
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

const deleteFiles = async function(req, res) {
    try {
        log.verbose('Start deleting files...');
        let deleteObjects = [];
        let files;
        files = await File.find({ '_id': { $in: req.body.ids } });
        // const userFiles = files.filter(o => o.author.toString() === req.user._id.toString());

        if (checkRole(req.user, 'admin')) {
            deleteObjects = files.map(o => ({ Key: o.data.key }));
        } else {
            files = files.filter(o => o.author.toString() === req.user._id.toString());
            deleteObjects = files.map(o => ({ Key: o.data.key }));
        }

        const deleteParams = {
            Bucket: process.env.AWS_S3_BUCKET,
            Delete: { Objects: deleteObjects },
        };

        if (deleteObjects.length > 0) {
            await deleteFromS3(deleteParams);
            await File.deleteMany({ '_id': { '$in': files.map(o => o._id) }});
            defaultResponse(req, res, 200, 'Deleted');
        } else {
            defaultResponse(req, res, 200, 'Nothing to delete');
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
    deleteFiles,
};

