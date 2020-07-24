/* eslint-disable no-param-reassign */
const mongoose = require('mongoose');

const options = {
  toObject: {
    transform(doc, ret) {
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
  toJSON: {
    transform(doc, ret) {
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
  minimize: false,
};

const schemaDefinition = require('../schema/authorization_code');

const schemaInstance = mongoose.Schema(schemaDefinition, options);

const modelInstance = mongoose.model('authorization_code', schemaInstance);

modelInstance.findAll = (query) => modelInstance
  .find(query)
  .then((result) => Promise.resolve(result))
  .catch((error) => Promise.reject(new Error(error.message)));

modelInstance.findByCode = (code) => modelInstance
  .findOne({ code })
  .then((result) => Promise.resolve(result))
  .catch((error) => Promise.reject(new Error(error.message)));

modelInstance.removeByCode = (code) => modelInstance
  .findOneAndRemove({ code }).then((result) => {
    if (result === null) return Promise.reject(new Error('Not found'));
    return Promise.resolve(result);
  })
  .catch((error) => Promise.reject(new Error(error.message)));

module.exports = modelInstance;
