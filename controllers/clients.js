// const fs = require('fs-extra');
// const config = require('config');
const log = require('library/logger');

const Client = require('mongo/model/client');

const {
  authoriseUser,
  defaultResponse,
  promiseRejectWithError,
} = require('library/utils');

const filterResponse = (result) => result;

const invalidRequest = (req, res) => {
  defaultResponse(req, res, 405);
};

const findAll = async (req, res) => {
  try {
    const user = await authoriseUser(req, res);
    const clients = await Client.findAll(req.query);
    const result = filterResponse(clients, user);
    defaultResponse(req, res, 200, result);
  } catch (error) {
    log.error(error.message);
    promiseRejectWithError(req, res, error.httpStatusCode, error.message);
  }
};

module.exports = {
  invalidRequest,
  findAll,
};
