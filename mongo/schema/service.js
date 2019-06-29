'use strict';

const mongoose = require('mongoose');

module.exports = {
  serviceName: {
    type: String,
  },
  slotLength: {
    type: Number,
  },
  slotCapacity: {
    type: Number,
  },
  slotCalendars: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'calendar',
    }
  ],
  bookingCalendar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'calendar',
  },
};

