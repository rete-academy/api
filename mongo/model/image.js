'use strict';

const {
  getImage,
  // getImages,
  setImage,
  delImage,
} = require('library/cache');

let options = {
  toObject: {
    transform: function (doc, ret) {
      delete ret._id;
      delete ret.__v;
      ret.data = "image buffer data";
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

let mongoose = require('mongoose'),
  modelName = 'image',
  schemaDefinition = require('../schema/' + modelName),
  schemaInstance = mongoose.Schema(schemaDefinition, options);

schemaInstance.index({ image_id: 1 });

let modelInstance = mongoose.model(modelName, schemaInstance),
  Image = module.exports = modelInstance;


module.exports.findAll = function (query) {
  return Image.find(query).then(function (result) {
    return Promise.resolve(result);
  }).catch(function(error) { 
    return Promise.reject(error.message);
  });
};

module.exports.findById = function (id) {
  let cache = getImage(id);
  if (cache !== undefined) return Promise.resolve(cache);
  return Image.findOne({image_id: id}).then(function (result) {
    if (result !== null) setImage(result);
    return Promise.resolve(result);
  }).catch(function(error) { 
    return Promise.reject(error.message);
  });
};

module.exports.findByDocIdAndType = function (id, type) {
  return Image.findOne({doc_id: id, type: type}).then(function (result) {
    return Promise.resolve(result);
  }).catch(function(error) { 
    return Promise.reject(error.message);
  });
};

module.exports.createNew = function (doc) {
  doc.created_time = Date.now();
  doc.image_id = new mongoose.mongo.ObjectID();
  return Image.create(doc).then(function (result) {
    setImage(result);
    return Promise.resolve(result);
  }).catch(function(error) { 
    return Promise.reject(error.message);
  });
};

module.exports.updateById = function (id, doc) {
  let image = doc;

  // Delete non-updatable fields from the request
  delete image.created_time;
  delete image.image_id;
  delete image.type;
  delete image.__v;
  delete image._id;

  return Image.findOneAndUpdate({image_id: id}, image, {new: true}).then(function (result) {
    if (result === null) return Promise.reject('Not found');
    setImage(result);
    return Promise.resolve(result);
  }).catch(function(error) { 
    return Promise.reject(error.message);
  });
};

module.exports.removeById = function (id) {
  return Image.findOneAndRemove({image_id: id}).then(function (result) {
    if (result === null) return Promise.reject('Not found');
    delImage(result.image_id);
    return Promise.resolve(result);
  }).catch(function(error) { 
    return Promise.reject(error.message);
  });
};

module.exports.removeByDocIdAndType = function (id, type) {
  return Image.findOneAndRemove({doc_id: id, type: type}).then(function (result) {
    if (result !== null) delImage(result.image_id);
    return Promise.resolve(result);
  }).catch(function(error) { 
    return Promise.reject(error.message);
  });
};
