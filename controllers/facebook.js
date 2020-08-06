const log = require('library/logger');
const {
  defaultResponse,
} = require('library/utils');

const initialize = async (req, res) => {
  log.silly('Start handling the login...');

  try {
    // const { body, user } = req;
    defaultResponse(req, res, 201, { message: 'Login successfully' });
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    defaultResponse(req, res, error.httpStatusCode, error.message);
  }
};

const check = (req, res) => {
  defaultResponse(req, res, 200, { message: 'Login ok' });
};

const handleFail = (req, res) => {
  defaultResponse(req, res, 403, { message: 'Failed login by Facebook' });
};

module.exports = {
  initialize,
  check,
  handleFail,
};
