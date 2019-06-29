'use strict';

const refine = function (doc, ret) {
  ret.createdTime = ret._id.getTimestamp();
  delete ret.__v;
  return ret;
};

let mongoose = require('mongoose'),
  modelName = 'service',
  schemaDefinition = require('../schema/' + modelName),
  schemaInstance = mongoose.Schema(schemaDefinition, {
    collection: 'services',
    toObject: {transform: refine},
    toJSON: {transform: refine},
    minimize: false
  });

let modelInstance = mongoose.model(modelName, schemaInstance),
  Collection = module.exports = modelInstance;

module.exports.findAll = function (query) {
  if (query._id) if (!mongoose.Types.ObjectId.isValid(query._id)) return Promise.resolve([]);

  return Collection.find({})
    .sort({ serviceName: 1 })
    .populate('bookingCalendar')
    .populate('slotCalendars')
    .then(function (services) {
      if (query.calendar) {
        return Promise.resolve(services.filter((s) => {
          return s.slotCalendars.find(c => c.calendarId === query.calendar) ||
                s.bookingCalendar.calendarId === query.calendar;
        }));
      } else {
        return Promise.resolve(services);
      }
    })
    .catch(function (error) {
      return Promise.reject(error);
    });
};

module.exports.findById = function (value) {
  if (!mongoose.Types.ObjectId.isValid(value)) return Promise.resolve(null);
  return Collection.findOne({ _id: value })
    .populate('bookingCalendar')
    .populate('slotCalendars')
    .then(function (result) {
      return Promise.resolve(result);
    })
    .catch(function (error) {
      return Promise.reject(error);
    });
};

module.exports.createNew = function (object) {
  return Collection.create(object).then(function (result) {
    return Promise.resolve(result);
  }).catch(function (error) {
    return Promise.reject(error);
  });
};

module.exports.updateById = function (value, object) {
  if (!mongoose.Types.ObjectId.isValid(value)) return Promise.resolve(null);
  let doc = object;
  delete doc.__v;
  delete doc._id;
  return Collection.findOneAndUpdate({ _id: value }, doc, { new: true })
    .then(function (result) {
      if (result === null) return Promise.reject('Not found');

      return Promise.resolve(result);
    })
    .catch(function (error) {
      return Promise.reject(error);
    });
};

module.exports.removeById = function (value) {
  if (!mongoose.Types.ObjectId.isValid(value)) return Promise.resolve(null);
  return Collection.findOneAndRemove({ _id: value }).then(function (result) {
    if (result === null) return Promise.reject('Not found');
    return Promise.resolve(result);
  }).catch(function (error) {
    return Promise.reject(error);
  });
};

