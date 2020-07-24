/* eslint-disable no-param-reassign */
const mongoose = require('mongoose');

const schemaDefinition = require('../schema/client');

const transform = (doc, ret) => {
  delete ret._id;
  delete ret.__v;
  if (ret.created_time) ret.created_time = ret.created_time.getTime();
  if (ret.updated_time) ret.updated_time = ret.updated_time.getTime();
  return ret;
};

const schemaInstance = mongoose.Schema(schemaDefinition, {
  toObject: { transform },
  toJSON: { transform },
  minimize: false,
});

schemaInstance.index({ client_id: 1 });

const modelInstance = mongoose.model('client', schemaInstance);

modelInstance.findAll = (query) => modelInstance
  .find(query)
  .then((result) => Promise.resolve(result))
  .catch((error) => Promise.reject(error.message));

modelInstance.findById = (id) => modelInstance
  .findOne({ client_id: id })
  .then((result) => Promise.resolve(result))
  .catch((error) => Promise.reject(error.message));

modelInstance.createNew = (doc) => {
  const client = doc;
  client.created_time = Date.now();
  return modelInstance
    .create(client)
    .then((result) => Promise.resolve(result))
    .catch((error) => Promise.reject(error.message));
};

modelInstance.updateById = (id, doc) => {
  const client = doc;

  // Delete non-updatable fields from the request
  delete client.created_time;
  delete client.__v;
  delete client._id;

  return modelInstance.findOneAndUpdate({ client_id: id }, client, { new: true }).then((result) => {
    if (result === null) return Promise.reject(new Error('Not found'));
    return Promise.resolve(result);
  }).catch((error) => Promise.reject(error.message));
};

modelInstance.removeById = (id) => modelInstance.findOneAndRemove({ client_id: id }).then((result) => {
  if (result === null) return Promise.reject(new Error('Not found'));
  return Promise.resolve(result);
}).catch((error) => Promise.reject(error.message));

module.exports = modelInstance;
