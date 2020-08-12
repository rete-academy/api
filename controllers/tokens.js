const log = require('library/logger');
const AccessToken = require('mongo/model/token');
const {
  // authoriseUser,
  defaultResponse,
  // promiseRejectWithError,
} = require('library/utils');

module.exports.invalidRequest = function (req, res) {
  defaultResponse(req, res, 405);
};

module.exports.testToken = function (req, res) {
  defaultResponse(req, res, 200, {
    user: req.user,
  });
};

module.exports.findAll = async function (req, res) {
  try {
    const allTokens = await AccessToken.findAll(req.query);
    defaultResponse(req, res, 200, allTokens);
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    defaultResponse(req, res, error.httpStatusCode, error.message);
  }
};

module.exports.find = async function (req, res) {
  try {
    const token = await AccessToken.findByToken(req.params.token);
    defaultResponse(req, res, 200, token);
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    defaultResponse(req, res, error.httpStatusCode, error.message);
  }
};

module.exports.remove = async function (req, res) {
  try {
    const deleted = await AccessToken.removeByToken(req.params.id);
    defaultResponse(req, res, 200, deleted);
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    defaultResponse(req, res, error.httpStatusCode, error.message);
  }
};
