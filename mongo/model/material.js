'use strict';

const mongoose = require('mongoose');
const log = require('library/logger');
const modelName = require('path').basename(__filename).slice(0, -3);

const refine = function (doc, ret) {
  delete ret.__v;
  return ret;
};

const schemaDefinition = require('../schema/' + modelName);
const schemaInstance = mongoose.Schema(schemaDefinition, {
  // collection: `${modelName}s`,
  toObject: {transform: refine},
  toJSON: {transform: refine},
  minimize: false
});

const modelInstance = mongoose.model(modelName, schemaInstance);

modelInstance.findAll = async function(query) {
  try {
    log.silly('Finding ' + modelName);
    return await modelInstance.find(query);
  } catch(error) { 
    log.error(`${error.name}: ${error.message}`);
    throw error;
  }
};

modelInstance.findById = async function(id) {
  try {
    log.silly('Start finding ' + modelName + ' with id ' + id);
    return await modelInstance.findOne({ _id: id });
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    throw error;
  }
};

modelInstance.createNew = async function(obj) {
  try {
    log.silly('Creating a new ' + modelName);
    obj.createdTime = Date.now();
    obj.updatedTime = Date.now();
    return await modelInstance.create(obj);
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    throw error;
  }
};

modelInstance.updateById = async function(id, doc) {
  try {
    log.silly('Updating a ' + modelName + ' with id ' + id);
    let data = { ...doc };
    delete data._id;
    delete data.__v;
    data.updatedTime = Date.now();
    return await modelInstance.findOneAndUpdate({ _id: id }, data, { new: true });
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    throw error;
  }
};

modelInstance.removeById = async function(id) {
  try {
    log.silly('Start remove a ' + modelName + ' with id ' + id)
    return await modelInstance.findOneAndDelete({ _id: id })
  } catch (error) {
    log.error(`${error.name}: ${error.message}`);
    throw error;
  }
};

module.exports = modelInstance;
