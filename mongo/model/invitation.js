'use strict';

const config = require('config');

let options = {
  toObject: {
    transform: function (doc, ret) {
      delete ret._id;
      delete ret.__v;
      if (ret.created_time) ret.created_time = ret.created_time.getTime();
      if (ret.updated_time) ret.updated_time = ret.updated_time.getTime();
      return ret;
    }
  },
  toJSON: {
    transform: function (doc, ret) {
      delete ret._id;
      delete ret.__v;
      if (ret.created_time) ret.created_time = ret.created_time.getTime();
      if (ret.updated_time) ret.updated_time = ret.updated_time.getTime();
      return ret;
    }
  },
  minimize: false
};

let mongoose = require('mongoose'),
  modelName = 'invitation',
  schemaDefinition = require('../schema/' + modelName),
  schemaInstance = mongoose.Schema(schemaDefinition, options);

schemaInstance.index({ code: 1 });

let modelInstance = mongoose.model(modelName, schemaInstance),
  Invitation = module.exports = modelInstance;

module.exports.findAll = function (query) {
  return Invitation.find(query).then(function (result) {
    return Promise.resolve(result);
  }).catch(function(error) { 
    return Promise.reject(error.message);
  });
};

module.exports.findById = function (id) {
  return Invitation.findOne({invitation_id: id}).then(function (result) {
    return Promise.resolve(result);
  }).catch(function(error) { 
    return Promise.reject(error.message);
  });
};

module.exports.findByCreator = function (id) {
  return Invitation.find({created_by: id}).then(function (result) {
    return Promise.resolve(result);
  }).catch(function(error) { 
    return Promise.reject(error.message);
  });
};

module.exports.findByCode = function (code) {
  return Invitation.findOne({code: code}).then(function (result) {
    return Promise.resolve(result);
  }).catch(function(error) { 
    return Promise.reject(error.message);
  });
};

module.exports.createNew = function (doc) {
  let invitation = doc;
  invitation.created_time = Date.now();
  invitation.updated_time = Date.now();
  invitation.invitation_id = new mongoose.mongo.ObjectID();

  invitation = JSON.parse(JSON.stringify(invitation));
  return Invitation.create(invitation).then(function (result) {
    return Promise.resolve(result);
  }).catch(function(error) {
    return Promise.reject(error.message);
  });
};

module.exports.findAndUpdateStatus = function (id, new_status) {
  return Invitation.findOneAndUpdate(
    { 'invitation_id': id },
    { $set: {"status": new_status}},
    { new: true},
  )
    .then(result => {
      if (result === null) {
        return Promise.reject(error.message);
      } else {
        return Invitation.findOneAndUpdate(
          { "invitation_id": id },
          { $set: {"updated_time": Date.now() } },
          { new: true },
        )
          .then(result => {
            return Promise.resolve();
          });
      }
    }).catch(error => {
      return Promise.reject(error.message);
    });
};

module.exports.removeById = function (id) {
  return Invitation.findOneAndRemove({invitation_id: id}).then(function (result) {
    if (result === null) return Promise.reject('Not found');
    return Promise.resolve(result);
  }).catch(function(error) {
    return Promise.reject(error.message);
  });
};

module.exports.isExpired = function (invitation) {
  if (invitation.status !== 0) return true;
  return Math.round((Date.now() - invitation.created_time) / 1000) > config.limit.codeLife;
};
