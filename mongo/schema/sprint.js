'use strict';
/*
 * Sprint schema definitions
 */
const mongoose = require('mongoose');

module.exports = {
    name: {
        type: String,
    },
    description: {
        type: String,
    },
    image: {
        type: String,
    },
    materials: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'material',
        },
    ],
    preferences: {
        type: mongoose.Schema.Types.Mixed,
    },
    meta: {
        type: mongoose.Schema.Types.Mixed,
        default: {
            version: 1,
        },
    },
    createdTime: {
        type: Date,
        default: Date.now,
    },
    updatedTime: {
        type: Date,
        default: Date.now,
    },
};

