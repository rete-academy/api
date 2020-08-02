const mongoose = require('mongoose');
const schemaDefinition = require('../schema/token');

const transform = function (doc, ret) {
  delete ret.__v;
  return ret;
};

const schemaInstance = mongoose.Schema(schemaDefinition, {
  toObject: { transform },
  toJSON: { transform },
  minimize: false,
});

schemaInstance.index({ expires: 1 }, { expireAfterSeconds: 0 });

const modelInstance = mongoose.model('token', schemaInstance);

modelInstance.findAll = function (query) {
  return modelInstance
    .find(query)
    .then((result) => Promise.resolve(result))
    .catch((error) => Promise.reject(error.message));
};

modelInstance.findByToken = function (token) {
  return modelInstance
    .findOne({ token })
    .then((result) => Promise.resolve(result))
    .catch((error) => Promise.reject(error.message));
};

modelInstance.removeByToken = function (token) {
  return modelInstance
    .findOneAndRemove({ token })
    .then((result) => Promise.resolve(result))
    .catch((error) => Promise.reject(error.message));
};

module.exports = modelInstance;
