'use strict';

const path = require('path');
const mongoose = require('mongoose');
const modelName = path.basename(__filename).slice(0, -3);

let options = {
  toObject: {
    transform: function (doc, ret) {
      delete ret._id;
      delete ret.__v;
      if (ret.created_time) ret.created_time = ret.created_time.getTime();
      return ret;
    }
  },
  toJSON: {
    transform: function (doc, ret) {
      delete ret._id;
      delete ret.__v;
      if (ret.created_time) ret.created_time = ret.created_time.getTime();
      return ret;
    }
  },
  minimize: false
};

let schemaDefinition = require('../schema/' + modelName),
  schemaInstance = mongoose.Schema(schemaDefinition, options);

schemaInstance.index({ 'expires': 1 }, { expireAfterSeconds: 0 });

let modelInstance = mongoose.model(modelName, schemaInstance),
  AccessToken = module.exports = modelInstance;

module.exports.findAll = function (query) {
  return AccessToken.find(query).then(function (result) {
    return Promise.resolve(result);
  }).catch(function(error) {
    return Promise.reject(error.message);
  });
};

module.exports.findByToken = function (token) {
  return AccessToken.findOne({token: token}).then(function (result) {
    return Promise.resolve(result);
  }).catch(function(error) {
    return Promise.reject(error.message);
  });
};

module.exports.removeByToken = function (token) {
  return AccessToken.findOneAndRemove({token: token}).then(function (result) {
    if (result === null) return Promise.reject('Not found');
    return Promise.resolve(result);
  }).catch(function(error) {
    return Promise.reject(error.message);
  });
};