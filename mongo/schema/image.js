const validate = require('mongoose-validator');

module.exports = {
  type: {
    // 0 - user
    type: Number,
    default: 0,
    validate: validate({ validator: 'isInt' }),
    min: 0,
    max: 0,
  },
  image_id: {
    type: String,
    required: true,
  },
  doc_id: {
    type: String,
    required: true,
  },
  data: Buffer,
  width: Number,
  height: Number,
  contentType: String,
  created_time: {
    type: Date,
    default: Date.now,
  },
};
