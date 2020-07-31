const {
  getImage,
  // getImages,
  setImage,
  delImage,
} = require('library/cache');

const options = {
  toObject: {
    transform(doc, ret) {
      delete ret._id;
      delete ret.__v;
      ret.data = 'image buffer data';
      if (ret.created_time) ret.created_time = ret.created_time.getTime();
      return ret;
    },
  },
  toJSON: {
    transform(doc, ret) {
      delete ret._id;
      delete ret.__v;
      if (ret.created_time) ret.created_time = ret.created_time.getTime();
      return ret;
    },
  },
  minimize: false,
};

const mongoose = require('mongoose');

const modelName = 'image';
const schemaDefinition = require(`../schema/${modelName}`);
const schemaInstance = mongoose.Schema(schemaDefinition, options);

schemaInstance.index({ image_id: 1 });

const modelInstance = mongoose.model(modelName, schemaInstance);
const Image = module.exports = modelInstance;

module.exports.findAll = function (query) {
  return Image.find(query).then((result) => Promise.resolve(result)).catch((error) => Promise.reject(error.message));
};

module.exports.findById = function (id) {
  const cache = getImage(id);
  if (cache !== undefined) return Promise.resolve(cache);
  return Image.findOne({ image_id: id }).then((result) => {
    if (result !== null) setImage(result);
    return Promise.resolve(result);
  }).catch((error) => Promise.reject(error.message));
};

module.exports.findByDocIdAndType = function (id, type) {
  return Image.findOne({ doc_id: id, type }).then((result) => Promise.resolve(result)).catch((error) => Promise.reject(error.message));
};

module.exports.createNew = function (doc) {
  doc.created_time = Date.now();
  doc.image_id = new mongoose.mongo.ObjectID();
  return Image.create(doc).then((result) => {
    setImage(result);
    return Promise.resolve(result);
  }).catch((error) => Promise.reject(error.message));
};

module.exports.updateById = function (id, doc) {
  const image = doc;

  // Delete non-updatable fields from the request
  delete image.created_time;
  delete image.image_id;
  delete image.type;
  delete image.__v;
  delete image._id;

  return Image.findOneAndUpdate({ image_id: id }, image, { new: true }).then((result) => {
    if (result === null) return Promise.reject('Not found');
    setImage(result);
    return Promise.resolve(result);
  }).catch((error) => Promise.reject(error.message));
};

module.exports.removeById = function (id) {
  return Image.findOneAndRemove({ image_id: id }).then((result) => {
    if (result === null) return Promise.reject('Not found');
    delImage(result.image_id);
    return Promise.resolve(result);
  }).catch((error) => Promise.reject(error.message));
};

module.exports.removeByDocIdAndType = function (id, type) {
  return Image.findOneAndRemove({ doc_id: id, type }).then((result) => {
    if (result !== null) delImage(result.image_id);
    return Promise.resolve(result);
  }).catch((error) => Promise.reject(error.message));
};
