"use strict";
const validate = require('mongoose-validator');

const emailValidator = validate({
  validator: 'isEmail',
  message: 'Must be valid email address',
});

module.exports = {
  created_time: {
    type: Date,
    default: Date.now,
  },
  updated_time: {
    type: Date,
  },
  invitation_id: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    validate: emailValidator,
  },
  code: {
    type: String,
    required: true,
  },
  created_by: {
    type: String,
  },
  invitation_to: {
    type: String,
  },
  sku: {
    type: String,
  },
  country: {
    type: String,
  },
  city: {
    type: String,
  },
  orderId: {
    type: String,
  },
  status: {
    // 0 - available
    // 1 - accepted
    // 2 - declined
    type: Number,
    default: 0,
    validate: {
      validator: Number.isInteger,
      message: '{VALUE} is not an integer value',
    },
    min: 0,
    max: 2,
  },
  type: {
    // 0 - user
    type: Number,
    default: 0,
    validate: {
      validator: Number.isInteger,
      message: '{VALUE} is not an integer value',
    },
    min: 0,
    max: 0,
  }
};
