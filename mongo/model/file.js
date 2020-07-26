/* eslint-disable no-param-reassign */
const mongoose = require('mongoose');
// const { isArray } = require('library/utils');
// const randomize = require('randomatic');
const log = require('library/logger');
const schemaDefinition = require('../schema/file');

const refine = function (doc, ret) {
  delete ret.__v;
  delete ret.hashedPassword;
  delete ret.salt;
  if (ret.createdTime) ret.createdTime = ret.createdTime.getTime();
  if (ret.updatedTime) ret.updatedTime = ret.updatedTime.getTime();
  return ret;
};

const schemaInstance = mongoose.Schema(schemaDefinition, {
  toObject: { transform: refine },
  toJSON: { transform: refine },
  minimize: false,
});

const modelInstance = mongoose.model('file', schemaInstance);

modelInstance.listAll = async function (query) {
  log.silly('Start finding all files');

  return modelInstance.find(query).populate('author');
};

modelInstance.findById = async function (id) {
  log.silly(`Start finding file with id: ${id}`);

  return modelInstance.findOne({ _id: id }).populate('author');
};

modelInstance.createNew = async function (file) {
  log.silly('Start create a new file');

  return modelInstance.create(file);
};

modelInstance.removeById = function (id) {
  log.silly(`Start remove a file with id ${id}`);

  return modelInstance.findOneAndRemove({ _id: id })
    .then((result) => {
      if (result === null) {
        return Promise.reject(new Error('Not found'));
      }
      return Promise.resolve(result);
    }).catch((error) => {
      log.error(error.message);
      return Promise.reject(error.message);
    });
};

module.exports = modelInstance;
