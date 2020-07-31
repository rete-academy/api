const log = require('library/logger');
const Material = require('mongo/model/material');

const {
  checkAuthor,
  checkRole,
  defaultResponse,
  // promiseRejectWithError,
} = require('library/utils');

const invalidRequest = function (req, res) {
  defaultResponse(req, res, 405);
};

const findAll = async function (req, res) {
  try {
    log.verbose('Start finding all materials');
    const allMaterials = await Material.findAll(req.query);
    defaultResponse(req, res, 200, allMaterials);
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    defaultResponse(req, res, error.httpStatusCode, error.message);
  }
};

const createMaterial = async function (req, res) {
  log.silly('Start creating a material...');
  try {
    const { body, user } = req;

    if (checkRole(user, 'teacher')) {
      const createdMaterial = await Material.createNew(body);
      log.debug('New material was created');
      defaultResponse(req, res, 201, createdMaterial);
    } else {
      defaultResponse(req, res, 403);
    }
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    defaultResponse(req, res, error.httpStatusCode, error.message);
  }
};

const updateMaterial = async function (req, res) {
  log.silly('Start updating a material...');
  try {
    const { body, params, user } = req;
    console.log('### body:', body);

    if (checkRole(user, 'teacher')) {
      const updated = await Material.updateById(params.id, body);
      console.log('### updated:', updated);
      log.debug('Material was updated');
      defaultResponse(req, res, 200, updated);
    } else {
      defaultResponse(req, res, 403);
    }
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    defaultResponse(req, res, error.httpStatusCode, error.message);
  }
};

const removeMaterial = async function (req, res) {
  try {
    const { params, user } = req;
    const found = await Material.findById(params.id);

    if (found) {
      // only allow admin or author delete
      if (checkRole(user, 'admin') || checkAuthor(user, found)) {
        const deleted = await Material.removeById(params.id);
        log.debug('Material was deleted');
        defaultResponse(req, res, 200, deleted);
      } else {
        defaultResponse(req, res, 403);
      }
    } else {
      defaultResponse(req, res, 404);
    }
  } catch (error) {
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
