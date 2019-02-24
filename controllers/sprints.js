'use strict';

const log = require('library/logger');
const Sprint = require('mongo/model/sprint');

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
        log.verbose('Start finding all sprints');
        const allSprints = await Sprint.findAll(req.query);
        defaultResponse(req, res, 200, allSprints);
    } catch (error) { 
        log.error(`${error.name}: ${error.message}`);
        defaultResponse(req, res, error.httpStatusCode, error.message);
    }
};

const createSprint = async function(req, res) {
    log.silly('Start creating a sprint...');
    try {
        const createdSprint = await Sprint.createNew(req.body);
        log.debug('New sprint was created');
        defaultResponse(req, res, 201, createdSprint);
    } catch(error) { 
        log.error(`${error.name}: ${error.message}`);
        defaultResponse(req, res, error.httpStatusCode, error.message);
    }
};

const updateSprint = async function(req, res) {
    log.silly('Start updating a sprint...');
    try {
        delete req.body.materials;
        const updated = await Sprint.updateById(req.params.id, req.body);
        log.debug('Sprint was updated');
        defaultResponse(req, res, 200, updated);
    } catch(error) { 
        log.error(`${error.name}: ${error.message}`);
        defaultResponse(req, res, error.httpStatusCode, error.message);
    }
};

const addMaterials = async function(req, res) {
    log.silly('Start adding materials to sprint...');
    try {
        const updated = await Sprint.addMaterials(req.params.id, req.body);
        log.debug('Sprint was updated');
        defaultResponse(req, res, 200, updated);
    } catch(error) { 
        log.error(`${error.name}: ${error.message}`);
        defaultResponse(req, res, error.httpStatusCode, error.message);
    }
};

const removeMaterials = async function(req, res) {
    log.silly('Start removing materials from sprint...');
    try {
        const updated = await Sprint.removeMaterials(req.params.id, req.body);
        log.debug('Sprint was updated');
        defaultResponse(req, res, 200, updated);
    } catch(error) { 
        log.error(`${error.name}: ${error.message}`);
        defaultResponse(req, res, error.httpStatusCode, error.message);
    }
};

const removeSprint = async function(req, res) {
    try {
        const deleted = await Sprint.removeById(req.params.id);
        log.debug('Sprint was deleted');
        defaultResponse(req, res, 200, deleted);
    } catch(error) { 
        log.error(`${error.name}: ${error.message}`);
        defaultResponse(req, res, error.httpStatusCode, error.message);
    }
};

module.exports = {
    invalidRequest,
    findAll,
    createSprint,
    updateSprint,
    removeSprint,
    addMaterials,
    removeMaterials,
};
