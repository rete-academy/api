const config = require('config');

const options = {
  toObject: {
    transform(doc, ret) {
      delete ret._id;
      delete ret.__v;
      if (ret.created_time) ret.created_time = ret.created_time.getTime();
      if (ret.updated_time) ret.updated_time = ret.updated_time.getTime();
      return ret;
    },
  },
  toJSON: {
    transform(doc, ret) {
      delete ret._id;
      delete ret.__v;
      if (ret.created_time) ret.created_time = ret.created_time.getTime();
      if (ret.updated_time) ret.updated_time = ret.updated_time.getTime();
      return ret;
    },
  },
  minimize: false,
};

const mongoose = require('mongoose');

const modelName = 'invitation';
const schemaDefinition = require(`../schema/${modelName}`);
const schemaInstance = mongoose.Schema(schemaDefinition, options);

schemaInstance.index({ code: 1 });

const modelInstance = mongoose.model(modelName, schemaInstance);
const Invitation = module.exports = modelInstance;

module.exports.findAll = function (query) {
  return Invitation.find(query).then((result) => Promise.resolve(result)).catch((error) => Promise.reject(error.message));
};

module.exports.findById = function (id) {
  return Invitation.findOne({ invitation_id: id }).then((result) => Promise.resolve(result)).catch((error) => Promise.reject(error.message));
};

module.exports.findByCreator = function (id) {
  return Invitation.find({ created_by: id }).then((result) => Promise.resolve(result)).catch((error) => Promise.reject(error.message));
};

module.exports.findByCode = function (code) {
  return Invitation.findOne({ code }).then((result) => Promise.resolve(result)).catch((error) => Promise.reject(error.message));
};

module.exports.createNew = function (doc) {
  let invitation = doc;
  invitation.created_time = Date.now();
  invitation.updated_time = Date.now();
  invitation.invitation_id = new mongoose.mongo.ObjectID();

  invitation = JSON.parse(JSON.stringify(invitation));
  return Invitation.create(invitation).then((result) => Promise.resolve(result)).catch((error) => Promise.reject(error.message));
};

module.exports.findAndUpdateStatus = function (id, new_status) {
  return Invitation.findOneAndUpdate(
    { invitation_id: id },
    { $set: { status: new_status } },
    { new: true },
  )
    .then((result) => {
      if (result === null) {
        return Promise.reject(error.message);
      }
      return Invitation.findOneAndUpdate(
        { invitation_id: id },
        { $set: { updated_time: Date.now() } },
        { new: true },
      )
        .then((result) => Promise.resolve());
    }).catch((error) => Promise.reject(error.message));
};

module.exports.removeById = function (id) {
  return Invitation.findOneAndRemove({ invitation_id: id }).then((result) => {
    if (result === null) return Promise.reject('Not found');
    return Promise.resolve(result);
  }).catch((error) => Promise.reject(error.message));
};

module.exports.isExpired = function (invitation) {
  if (invitation.status !== 0) return true;
  return Math.round((Date.now() - invitation.created_time) / 1000) > config.limit.codeLife;
};
