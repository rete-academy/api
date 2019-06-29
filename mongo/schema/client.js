'use strict';

module.exports = {
  updated_time: Date,
  redirect_uri: String,
  created_time: {
    type: Date,
    default: Date.now,
  },
  client_id: {
    type: String,
    unique: true,
    required: true,
  },
  client_secret: {
    type: String,
    required: true,
  },
};