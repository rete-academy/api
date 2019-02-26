'use strict';

const {
    isArray,
    filterPathData,
} = require('library/utils');
const log = require('library/logger');
const Path = require('mongo/model/path');
const User = require('mongo/model/user');

const {
    // authoriseUser,
    slugify,
    defaultResponse,
    // promiseRejectWithError,
} = require('library/utils');

const invalidRequest = function(req, res) {
    defaultResponse(req, res, 405);
};

const findAll = async function(req, res) {
    try {
        log.verbose('Start finding all paths');
        const allPaths = await Path.findAll(req.query);
        defaultResponse(req, res, 200, filterPathData(req.user, allPaths));
    } catch (error) { 
        log.error(`${error.name}: ${error.message}`);
        defaultResponse(req, res, error.httpStatusCode, error.message);
    }
};

const findSlug = async function(req, res) {
    try {
        log.verbose('Start finding path with ' + req.params.slug);
        const found = await Path.findSlug(req.params.slug);
        if (found) defaultResponse(req, res, 200, filterPathData(req.user, found));
        else defaultResponse(req, res, 404, 'Not Found');
    } catch (error) { 
        log.error(`${error.name}: ${error.message}`);
        defaultResponse(req, res, error.httpStatusCode, error.message);
    }
};

const enroll = async function(req, res) {
    log.silly('Start enrolling to a path...');
    try {
        const updated = await Path.enroll(req.params.id, req.body);
        const userIds = isArray(req.body.id) ? req.body.id : [req.body.id];
        userIds.forEach((userId) => {
            updated.sprints.forEach((sprint) => {
                sprint.materials.forEach(async (materialId) => {
                    // const updatedUser = await User.findOneAndUpdate({
                    await User.findOneAndUpdate({
                        _id: userId,
                        'progress.material': { '$ne': materialId },
                    }, {
                        '$push': {
                            'progress': {
                                path: updated._id.toString(),
                                sprint: sprint._id.toString(),
                                material: materialId.toString(),
                                status: 0,
                            }
                        }
                    }, {
                        new: true,
                    });
                });
            });
        });
        defaultResponse(req, res, 200, updated);
    } catch(error) { 
        log.error(`[Enroll controller] ${error.name}: ${error.message}`);
        defaultResponse(req, res, error.httpStatusCode, error.message);
    }
};

const unenroll = async function(req, res) {
    log.silly('Start unenrolling from a path...');
    try {
        const updated = await Path.unenroll(req.params.id, req.body);
        const userIds = isArray(req.body.id) ? req.body.id : [req.body.id];
        log.debug('Path was updated');
        log.debug(updated);
        userIds.forEach((userId) => {
            updated.sprints.forEach((sprint) => {
                sprint.materials.forEach(async (materialId) => {
                    await User.findOneAndUpdate({
                        _id: userId,
                        'progress.material': materialId,
                    }, {
                        '$pull': {
                            'progress': {
                                path: updated._id.toString(),
                                sprint: sprint._id.toString(),
                                material: materialId.toString(),
                            }
                        }
                    });
                });
            });
        });
        defaultResponse(req, res, 200, updated);
    } catch(error) { 
        log.error(`[Unenroll controller] ${error.name}: ${error.message}`);
        defaultResponse(req, res, error.httpStatusCode, error.message);
    }
};

const createPath = async function(req, res) {
    log.silly('Start creating a path...');
    try {
        req.body.slug = slugify(req.body.name);
        const createdSprint = await Path.createNew(req.body);
        log.debug('New Path was created');
        defaultResponse(req, res, 201, createdSprint);
    } catch(error) { 
        log.error(`${error.name}: ${error.message}`);
        defaultResponse(req, res, error.httpStatusCode, error.message);
    }
};

const updatePath = async function(req, res) {
    log.silly('Start updating a path...');
    try {
        delete req.body.sprints;
        const updated = await Path.updateById(req.params.id, req.body);
        log.debug('Path was updated');
        defaultResponse(req, res, 200, updated);
    } catch(error) { 
        log.error(`${error.name}: ${error.message}`);
        defaultResponse(req, res, error.httpStatusCode, error.message);
    }
};

const addSprints = async function(req, res) {
    log.silly('Start adding sprints to path...');
    try {
        const updated = await Path.addSprints(req.params.id, req.body);
        log.debug('Path was updated');
        defaultResponse(req, res, 200, updated);
    } catch(error) { 
        log.error(`${error.name}: ${error.message}`);
        defaultResponse(req, res, error.httpStatusCode, error.message);
    }
};

const removeSprints = async function(req, res) {
    log.silly('Start removing sprints from path...');
    try {
        const updated = await Path.removeSprints(req.params.id, req.body);
        log.debug('Path was updated');
        defaultResponse(req, res, 200, updated);
    } catch(error) { 
        log.error(`${error.name}: ${error.message}`);
        defaultResponse(req, res, error.httpStatusCode, error.message);
    }
};

const removePath = async function(req, res) {
    try {
        const deleted = await Path.removeById(req.params.id);
        log.debug('Path was deleted');
        defaultResponse(req, res, 200, deleted);
    } catch(error) { 
        log.error(`${error.name}: ${error.message}`);
        defaultResponse(req, res, error.httpStatusCode, error.message);
    }
};

module.exports = {
    invalidRequest,
    findAll,
    findSlug,
    enroll,
    unenroll,
    createPath,
    updatePath,
    removePath,
    addSprints,
    removeSprints,
};