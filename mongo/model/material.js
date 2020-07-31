/* eslint-disable no-param-reassign */
const mongoose = require('mongoose');
const log = require('library/logger');

const refine = function (doc, ret) {
  delete ret.__v;
  return ret;
};

const schemaDefinition = require('../schema/material');

const schemaInstance = mongoose.Schema(schemaDefinition, {
  toObject: { transform: refine },
  toJSON: { transform: refine },
  minimize: false,
});

const modelInstance = mongoose.model('material', schemaInstance);

modelInstance.findAll = async function (query) {
  try {
    log.silly('Finding materials...');
    return await modelInstance.find(query);
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    throw error;
  }
};

modelInstance.findById = async function (id) {
  try {
    log.silly(`Start finding material with id ${id}`);
    return await modelInstance.findOne({ _id: id });
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    throw error;
  }
};

modelInstance.createNew = async function (obj) {
  try {
    log.silly('Creating a new material');
    const data = { ...obj };
    data.createdTime = Date.now();
    data.updatedTime = Date.now();
    return await modelInstance.create(data);
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    throw error;
  }
};

modelInstance.updateById = async function (id, doc) {
  try {
    log.silly(`Updating a material with id ${id}`);
    const data = { ...doc };
    delete data._id;
    delete data.__v;
    data.updatedTime = Date.now();
    data.meta.version += 1;

    return await modelInstance.findOneAndUpdate({ _id: id }, data, { new: true });
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    throw error;
  }
};

modelInstance.removeById = async function (id) {
  try {
    log.silly(`Start remove a material with id ${id}`);
    return await modelInstance.findOneAndDelete({ _id: id });
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    throw error;
  }
};

module.exports = modelInstance;
