'use strict';

const validate = require('mongoose-validator');
const mongoose = require('mongoose');

const nameValidator = [
    validate({
        validator: 'isLength',
        arguments: [2, 30],
        message: 'Name should be between {ARGS[0]} and {ARGS[1]} characters',
    }),
    validate({
        validator: 'isAlphanumeric',
        passIfEmpty: false,
        message: 'Name should contain alpha-numeric characters only',
    }),
];

const emailValidator = validate({
    validator: 'isEmail',
    message: 'Must be valid email address',
});

module.exports = {
    username: {
        type: String,
        unique: true,
        validate: nameValidator,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: emailValidator,
    },
    name: {
        type: String,
    },
    avatar: {
        type: mongoose.Schema.Types.Mixed,
    },
    provider: {
        type: mongoose.Schema.Types.Mixed,
    },
    role: {
        type: Array, // [0: admin, 1: normal]
        default: [ 3 ],
        required: true,
    },
    address: {
        type: mongoose.Schema.Types.Mixed,
    },
    phone: {
        type: String
    },
    progress: [
        {
            path: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'path',
            },
            sprint: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'sprint',
            },
            material: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'material',
            },
            status: 0,
        },
    ],
    preferences: {
        type: mongoose.Schema.Types.Mixed,
    },
    meta: {
        type: mongoose.Schema.Types.Mixed,
        default: {
            version: 1,
            confirm: false,
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
    hashedPassword: {
        type: String,
    },
    salt: {
        type: String,
    },
};
