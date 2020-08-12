const refine = function (doc, ret) {
  ret.createdTime = ret._id.getTimestamp();
  delete ret.__v;
  return ret;
};

const mongoose = require('mongoose');

const modelName = 'service';
const schemaDefinition = require(`../schema/${modelName}`);
const schemaInstance = mongoose.Schema(schemaDefinition, {
  collection: 'services',
  toObject: { transform: refine },
  toJSON: { transform: refine },
  minimize: false,
});

const modelInstance = mongoose.model(modelName, schemaInstance);
const Collection = module.exports = modelInstance;

module.exports.findAll = function (query) {
  if (query._id) if (!mongoose.Types.ObjectId.isValid(query._id)) return Promise.resolve([]);

  return Collection.find({})
    .sort({ serviceName: 1 })
    .populate('bookingCalendar')
    .populate('slotCalendars')
    .then((services) => {
      if (query.calendar) {
        return Promise.resolve(services.filter((s) => s.slotCalendars.find((c) => c.calendarId === query.calendar)
                || s.bookingCalendar.calendarId === query.calendar));
      }
      return Promise.resolve(services);
    })
    .catch((error) => Promise.reject(error));
};

module.exports.findById = function (value) {
  if (!mongoose.Types.ObjectId.isValid(value)) return Promise.resolve(null);
  return Collection.findOne({ _id: value })
    .populate('bookingCalendar')
    .populate('slotCalendars')
    .then((result) => Promise.resolve(result))
    .catch((error) => Promise.reject(error));
};

module.exports.createNew = function (object) {
  return Collection.create(object).then((result) => Promise.resolve(result)).catch((error) => Promise.reject(error));
};

module.exports.updateById = function (value, object) {
  if (!mongoose.Types.ObjectId.isValid(value)) return Promise.resolve(null);
  const doc = object;
  delete doc.__v;
  delete doc._id;
  return Collection.findOneAndUpdate({ _id: value }, doc, { new: true })
    .then((result) => {
      if (result === null) return Promise.reject('Not found');

      return Promise.resolve(result);
    })
    .catch((error) => Promise.reject(error));
};

module.exports.removeById = function (value) {
  if (!mongoose.Types.ObjectId.isValid(value)) return Promise.resolve(null);
  return Collection.findOneAndRemove({ _id: value }).then((result) => {
    if (result === null) return Promise.reject('Not found');
    return Promise.resolve(result);
  }).catch((error) => Promise.reject(error));
};
