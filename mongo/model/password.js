'use strict';

const mongoose = require('mongoose');
const randomize = require('randomatic');
const log = require('library/logger');
const modelName = require('path').basename(__filename).slice(0, -3);

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
  minimize: false,
};

const schemaDefinition = require('../schema/' + modelName);
const schemaInstance = mongoose.Schema(schemaDefinition, options);
const modelInstance = mongoose.model(modelName, schemaInstance);

schemaInstance.index({ token: 1 });

modelInstance.findAll = async function(query) {
  log.silly('Start finding all ' + modelName);
  try {
    return await modelInstance.find(query);
  } catch(error) { 
    log.error(`${error.name}: ${error.message}`);
    throw error;
  }
};

modelInstance.findByToken = async function(token) {
  log.silly('Start finding token...');
  try {
    return await modelInstance.findOne({ token: token });
  } catch(error) { 
    log.error(`${error.name}: ${error.message}`);
    throw error;
  }
};

modelInstance.createNew = async function(doc) {
  log.silly('Start creating new token...');
  try {
    return await modelInstance.create({
      ...doc,
      createdTime: Date.now(), 
      token: randomize('a0', 32),
    });
  } catch(error) { 
    log.error(`${error.name}: ${error.message}`);
    throw error;
  }
};

modelInstance.removeByToken = async function(token) {
  log.silly('Start deleting token...');
  try {
    return await modelInstance.findOneAndDelete({ token });
  } catch(error) { 
    log.error(`${error.name}: ${error.message}`);
    throw error;
  }
};

module.exports = modelInstance;
