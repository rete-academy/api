const randomize = require('randomatic');

const log = require('library/logger');
const Sprint = require('mongo/model/sprint');

const {
  checkAuthor,
  checkRole,
  defaultResponse,
  slugify,
} = require('library/utils');

const invalidRequest = function (req, res) {
  defaultResponse(req, res, 405);
};

const findAll = async function (req, res) {
  try {
    log.verbose('Start finding all sprints');
    const allSprints = await Sprint.findAll(req.query);
    defaultResponse(req, res, 200, allSprints);
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    defaultResponse(req, res, error.httpStatusCode, error.message);
  }
};

const createSprint = async function (req, res) {
  log.silly('Start creating a sprint...');
  try {
    const { body, user } = req;
    if (checkRole(user, 'teacher')) {
      body.slug = `${slugify(body.name)}-${randomize('a0', 5)}`;
      body.authors = [user._id];
      body.meta.version = 1;
      const created = await Sprint.createNew(body);
      log.debug('New sprint was created');
      defaultResponse(req, res, 201, created);
    } else {
      defaultResponse(req, res, 403);
    }
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    defaultResponse(req, res, error.httpStatusCode, error.message);
  }
};

const updateSprint = async function (req, res) {
  log.silly('Start updating a sprint...');
  try {
    if (checkRole(req.user, 'teacher')) {
      delete req.body.materials;
      const updated = await Sprint.updateById(req.params.id, req.body);
      log.debug('Sprint was updated');
      defaultResponse(req, res, 200, updated);
    } else {
      defaultResponse(req, res, 403);
    }
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    defaultResponse(req, res, error.httpStatusCode, error.message);
  }
};

const addMaterials = async function (req, res) {
  log.silly('Start adding materials to sprint...');
  try {
    if (checkRole(req.user, 'teacher')) {
      const updated = await Sprint.addMaterials(req.params.id, req.body);
      log.debug('Sprint was updated');
      defaultResponse(req, res, 200, updated);
    } else {
      defaultResponse(req, res, 403);
    }
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    defaultResponse(req, res, error.httpStatusCode, error.message);
  }
};

const removeMaterials = async function (req, res) {
  log.silly('Start removing materials from sprint...');
  try {
    if (checkRole(req.user, 'teacher')) {
      const updated = await Sprint.removeMaterials(req.params.id, req.body);
      log.debug('Sprint was updated');
      defaultResponse(req, res, 200, updated);
    } else {
      defaultResponse(req, res, 403);
    }
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    defaultResponse(req, res, error.httpStatusCode, error.message);
  }
};

const removeSprint = async function (req, res) {
  try {
    const found = await Sprint.findById(req.params.id);

    if (found) {
      if (checkRole(req.user, 'admin') || checkAuthor(req.user, found)) {
        const deleted = await Sprint.removeById(req.params.id);
        log.debug('Sprint was deleted');
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
  createSprint,
  updateSprint,
  removeSprint,
  addMaterials,
  removeMaterials,
};
