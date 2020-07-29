const randomize = require('randomatic');
const {
  checkRole,
  isArray,
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

const invalidRequest = (req, res) => {
  defaultResponse(req, res, 405);
};

const findAll = async (req, res) => {
  log.verbose('Start finding all paths');
  try {
    const allPaths = await Path.findAll(req.query);
    const filteredPaths = allPaths.filter((p) => {
      console.log('### user', req.user);
      console.log('### path', p);
      if (checkRole(req.user, 'admin')) {
        return true;
      }
      if (p.status === 'public') {
        return true;
      }
      if (p.authors.some((a) => a._id.toString() === req.user._id.toString())) {
        console.log('### is authors', p.authors);
        return true;
      }
      return false;
    });
    defaultResponse(req, res, 200, filteredPaths);
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    defaultResponse(req, res, error.httpStatusCode, error.message);
  }
};

const findSlug = async (req, res) => {
  try {
    log.verbose(`Start finding path with ${req.params.slug}`);
    const found = await Path.findSlug(req.params.slug);
    if (found) defaultResponse(req, res, 200, [found]);
    else defaultResponse(req, res, 404, 'Not Found');
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    defaultResponse(req, res, error.httpStatusCode, error.message);
  }
};

const enroll = async (req, res) => {
  log.silly('Start enrolling to a path...');
  try {
    const updatedPath = await Path.enroll(req.params.id, req.body);
    const userIds = isArray(req.body.id) ? req.body.id : [req.body.id];

    const progressArray = updatedPath
      .sprints.map((s) => s.materials.map((m) => ({
        path: updatedPath._id,
        sprint: s._id,
        material: m._id,
        status: 0,
      })))
      .reduce((i, v) => i.concat(v), []); // flat it

    await Promise.all(userIds.map(async (userId) => {
      await User.findOneAndUpdate(
        { _id: userId },
        {
          $addToSet: { progress: { $each: progressArray } },
          $inc: { 'meta.version': 1 },
        },
        { new: true },
      );
    }));
    defaultResponse(req, res, 200, updatedPath);
  } catch (error) {
    log.error(`[Enroll controller] ${error.name}: ${error.message}`);
    defaultResponse(req, res, error.httpStatusCode, error.message);
  }
};

const unenroll = async (req, res) => {
  log.silly('Start unenrolling from a path...');
  try {
    const updated = await Path.unenroll(req.params.id, req.body);
    await User.findOneAndUpdate({
      _id: req.body.id,
      'progress.path': req.params.id,
    }, {
      $pull: { progress: { path: req.params.id } },
    });
    log.debug('Path was updated');
    defaultResponse(req, res, 200, updated);
  } catch (error) {
    log.error(`[Unenroll controller] ${error.name}: ${error.message}`);
    defaultResponse(req, res, error.httpStatusCode, error.message);
  }
};

const createPath = async (req, res) => {
  log.silly('Start creating a path...');
  try {
    const { body, user } = req;
    if (checkRole(user, 'teacher')) {
      body.slug = `${slugify(body.name)}-${randomize('a0', 5)}`;
      body.authors = [user._id];
      const createdSprint = await Path.createNew(body);
      log.debug('New path was created');
      defaultResponse(req, res, 201, createdSprint);
    } else {
      defaultResponse(req, res, 403);
    }
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    defaultResponse(req, res, error.httpStatusCode, error.message);
  }
};

const updatePath = async (req, res) => {
  log.silly('Start updating a path...');
  try {
    delete req.body.sprints;
    if (checkRole(req.user, 'teacher')) {
      const updated = await Path.updateById(req.params.id, req.body);
      log.debug('Path was updated');
      defaultResponse(req, res, 200, updated);
    } else {
      defaultResponse(req, res, 403);
    }
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    defaultResponse(req, res, error.httpStatusCode, error.message);
  }
};

const addSprints = async (req, res) => {
  log.silly('Start adding sprints to path...');
  try {
    if (checkRole(req.user, 'admin')) {
      const updated = await Path.addSprints(req.params.id, req.body);
      log.debug('Path was updated');
      defaultResponse(req, res, 200, updated);
    } else {
      defaultResponse(req, res, 403);
    }
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    defaultResponse(req, res, error.httpStatusCode, error.message);
  }
};

const removeSprints = async (req, res) => {
  log.silly('Start removing sprints from path...');
  try {
    if (checkRole(req.user, 'admin')) {
      const updated = await Path.removeSprints(req.params.id, req.body);
      log.debug('Path was updated');
      defaultResponse(req, res, 200, updated);
    } else {
      defaultResponse(req, res, 403);
    }
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    defaultResponse(req, res, error.httpStatusCode, error.message);
  }
};

const removePath = async (req, res) => {
  try {
    if (checkRole(req.user, 'admin')) {
      const deleted = await Path.removeById(req.params.id);
      log.debug('Path was deleted');
      defaultResponse(req, res, 200, deleted);
    } else {
      defaultResponse(req, res, 403);
    }
  } catch (error) {
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
