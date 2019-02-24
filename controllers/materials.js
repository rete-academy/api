'use strict';

const log = require('library/logger');
const Material = require('mongo/model/material');

const {
    // authoriseUser,
    defaultResponse,
    // promiseRejectWithError,
} = require('library/utils');

const invalidRequest = function(req, res) {
    defaultResponse(req, res, 405);
};

const findAll = async function(req, res) {
    try {
        log.verbose('Start finding all materials');
        const allMaterials = await Material.findAll(req.query);
        defaultResponse(req, res, 200, allMaterials);
    } catch (error) { 
        log.error(`${error.name}: ${error.message}`);
        defaultResponse(req, res, error.httpStatusCode, error.message);
    }
};

const createMaterial = async function(req, res) {
    log.silly('Start creating a material...');
    try {
        const createdMaterial = await Material.createNew(req.body);
        log.debug('New material was created');
        defaultResponse(req, res, 201, createdMaterial);
    } catch(error) { 
        log.error(`${error.name}: ${error.message}`);
        defaultResponse(req, res, error.httpStatusCode, error.message);
    }
};

const updateMaterial = async function(req, res) {
    log.silly('Start updating a material...');
    try {
        const updated = await Material.updateById(req.params.id, req.body);
        log.debug('Material was updated');
        defaultResponse(req, res, 200, updated);
    } catch(error) { 
        log.error(`${error.name}: ${error.message}`);
        defaultResponse(req, res, error.httpStatusCode, error.message);
    }
};

const removeMaterial = async function(req, res) {
    try {
        const deleted = await Material.removeById(req.params.id);
        log.debug('Material was deleted');
        defaultResponse(req, res, 200, deleted);
    } catch(error) { 
        log.error(`${error.name}: ${error.message}`);
        defaultResponse(req, res, error.httpStatusCode, error.message);
    }
};

module.exports = {
    invalidRequest,
    findAll,
    createMaterial,
    updateMaterial,
    removeMaterial,
};
