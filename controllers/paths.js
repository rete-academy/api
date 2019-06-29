'use strict';

const {
  checkRole,
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
    const updatedPath = await Path.enroll(req.params.id, req.body);
    const userIds = isArray(req.body.id) ? req.body.id : [req.body.id];
    const progressArray = updatedPath
      .sprints.map((s) => (
        s.materials.map((m) => ({
          path: updatedPath._id,
          sprint: s._id,
          material: m._id,
          status: 0,
        }))
      ))
      .reduce((i, v) => i.concat(v), []); // flat it
        
    await Promise.all(userIds.map(async (userId) => {
      await User.findOneAndUpdate(
        { _id: userId },
        {
          '$addToSet': { 'progress': { '$each': progressArray } },
          '$inc': { 'meta.version': 1 },
        },
        { new: true });
    }));
    defaultResponse(req, res, 200, updatedPath);
  } catch(error) { 
    log.error(`[Enroll controller] ${error.name}: ${error.message}`);
    defaultResponse(req, res, error.httpStatusCode, error.message);
  }
};

const unenroll = async function(req, res) {
  log.silly('Start unenrolling from a path...');
  try {
    const updated = await Path.unenroll(req.params.id, req.body);
    await User.findOneAndUpdate({
      _id: req.body.id,
      'progress.path': req.params.id,
    }, {
      '$pull': { 'progress': { path: req.params.id } }
    });
    log.debug('Path was updated');
    defaultResponse(req, res, 200, updated);
  } catch(error) { 
    log.error(`[Unenroll controller] ${error.name}: ${error.message}`);
    defaultResponse(req, res, error.httpStatusCode, error.message);
  }
};

const createPath = async function(req, res) {
  log.silly('Start creating a path...');
  try {
    if (checkRole(req.user, 'admin')) {
      req.body.slug = slugify(req.body.name);
      const createdSprint = await Path.createNew(req.body);
      log.debug('New Path was created');
      defaultResponse(req, res, 201, createdSprint);
    } else {
      defaultResponse(req, res, 403);
    }
  } catch(error) { 
    log.error(`${error.name}: ${error.message}`);
    defaultResponse(req, res, error.httpStatusCode, error.message);
  }
};

const updatePath = async function(req, res) {
  log.silly('Start updating a path...');
  try {
    delete req.body.sprints;
    if (checkRole(req.user, 'admin')) {
      const updated = await Path.updateById(req.params.id, req.body);
      log.debug('Path was updated');
      defaultResponse(req, res, 200, updated);
    } else {
      defaultResponse(req, res, 403);
    }
  } catch(error) { 
    log.error(`${error.name}: ${error.message}`);
    defaultResponse(req, res, error.httpStatusCode, error.message);
  }
};

const addSprints = async function(req, res) {
  log.silly('Start adding sprints to path...');
  try {
    if (checkRole(req.user, 'admin')) {
      const updated = await Path.addSprints(req.params.id, req.body);
      log.debug('Path was updated');
      defaultResponse(req, res, 200, updated);
    } else {
      defaultResponse(req, res, 403);
    }
  } catch(error) { 
    log.error(`${error.name}: ${error.message}`);
    defaultResponse(req, res, error.httpStatusCode, error.message);
  }
};

const removeSprints = async function(req, res) {
  log.silly('Start removing sprints from path...');
  try {
    if (checkRole(req.user, 'admin')) {
      const updated = await Path.removeSprints(req.params.id, req.body);
      log.debug('Path was updated');
      defaultResponse(req, res, 200, updated);
    } else {
      defaultResponse(req, res, 403);
    }
  } catch(error) { 
    log.error(`${error.name}: ${error.message}`);
    defaultResponse(req, res, error.httpStatusCode, error.message);
  }
};

const removePath = async function(req, res) {
  try {
    if (checkRole(req.user, 'admin')) {
      const deleted = await Path.removeById(req.params.id);
      log.debug('Path was deleted');
      defaultResponse(req, res, 200, deleted);
    } else {
      defaultResponse(req, res, 403);
    }
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
