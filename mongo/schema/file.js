'use strict';

const mongoose = require('mongoose');

module.exports = {
    name: {
        type: String,
    },
    type: {
        type: String,
    },
    size: {
        type: String,
    },
    url: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        default: 'public' // 'private', 'unlisted'
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
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
};
