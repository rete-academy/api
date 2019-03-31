'use strict';

const mongoose = require('mongoose');

module.exports = {
    data: {
        type: mongoose.Schema.Types.Mixed,
        default: {
            fieldname: '',
            originalname: '',
            encoding: '',
            mimetype: '',
            size: 0,
            location: '',
        },
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