'use strict';

const {
  checkRole,
  // isArray,
} = require('library/utils');
const log = require('library/logger');
const Conversation = require('mongo/model/conversation');
const Material = require('mongo/model/material');

const {
  defaultResponse,
} = require('library/utils');

const invalidRequest = function(req, res) {
  defaultResponse(req, res, 405);
};

const findAll = async function(req, res) {
  try {
    log.verbose('Start finding all conversations');
    const results = await Conversation.findAll(req.query);
    defaultResponse(req, res, 200, results);
  } catch (error) { 
    log.error(`${error.name}: ${error.message}`);
    defaultResponse(req, res, error.httpStatusCode, error.message);
  }
};

const findById = async function(req, res) {
  try {
    log.verbose('Start finding a conversation');
    const result = await Conversation.findById(req.params.id);
    defaultResponse(req, res, 200, result);
  } catch (error) { 
    log.error(`${error.name}: ${error.message}`);
    defaultResponse(req, res, error.httpStatusCode, error.message);
  }
};

const createNew = async function(req, res) {
  try {
    log.verbose('Start finding all conversation');
    const result = await Conversation.create(req.body);
    await Material.findOneAndUpdate(
      { _id: req.body.material },
      { conversation: result._id },
      { new: true }
    );
    defaultResponse(req, res, 201, result);
  } catch (error) { 
    log.error(`${error.name}: ${error.message}`);
    defaultResponse(req, res, error.httpStatusCode, error.message);
  }
};

const addMessage = async function(req, res) {
  try {
    log.verbose('Start adding message into conversation...');
    if (req.body.content === '') {
      const old = await Conversation.findById(req.params.id);
      req.io.emit('CHAT_MESSAGE', old);
      return defaultResponse(req, res, 200, old);
    }
    const updated = await Conversation.addMessage(req.params.id, req.body);
    req.io.emit('CHAT_MESSAGE', updated);
    return defaultResponse(req, res, 201, updated);
  } catch(error) { 
    log.error(`${error.name}: ${error.message}`);
    defaultResponse(req, res, error.httpStatusCode, error.message);
  }
};

const remove = async function(req, res) {
  try {
    if (checkRole(req.user, 'admin')) {
      await Conversation.removeById(req.params.id);
      log.verbose('Conversation was deleted');
      defaultResponse(req, res, 200, 'Deleted');
    } else {
      defaultResponse(req, res, 403);
    }
  } catch(error) { 
    log.error(`${error.name}: ${error.message}`);
    defaultResponse(req, res, error.httpStatusCode, error.message);
  }
};

module.exports = {
  invalidRequest,
  findAll,
  findById,
  createNew,
  addMessage,
  remove,
};
