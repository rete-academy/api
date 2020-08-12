const Service = require('mongo/model/service');
const { defaultResponse } = require('library/utils');

module.exports.invalidRequest = function (req, res) {
  defaultResponse(req, res, 405);
};

module.exports.findAll = function (req, res) {
  Service.findAll(req.query).then((result) => {
    defaultResponse(req, res, 200, result);
  }).catch((error) => {
    defaultResponse(req, res, error.httpStatusCode, error.message);
  });
};

module.exports.findById = function (req, res) {
  Service.findById(req.params.id).then((result) => {
    defaultResponse(req, res, 200, result);
  }).catch((error) => {
    defaultResponse(req, res, error.httpStatusCode, error.message);
  });
};

module.exports.create = function (req, res) {
  Service.createNew(req.body).then((result) => {
    defaultResponse(req, res, 201, result);
  }).catch((error) => {
    defaultResponse(req, res, error.httpStatusCode, error.message);
  });
};

module.exports.updateById = function (req, res) {
  Service.updateById(req.params.id, req.body).then((result) => {
    defaultResponse(req, res, 200, result);
  }).catch((error) => {
    defaultResponse(req, res, error.httpStatusCode, error.message);
  });
};
