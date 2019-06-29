'use strict';

module.exports = {
  expires: Date,
  scope: String,
  created_time: {
    type: Date,
    default: Date.now
  },
  user_id: {
    type: String,
    required: true
  },
  client_id: {
    type: String,
    required: true
  },
  token: {
    type: String,
    unique: true,
    required: true
  },
};