'use strict';

const log = require('library/logger');
const {
    defaultResponse,
} = require('library/utils');

module.exports.test = function(req, res) {
    log.warn('just a test');    
    defaultResponse(req, res, 200, 'It is tested');
};

module.exports.callback = function(req, res) {
    defaultResponse(req, res, 200, 'I can do it mother fucker');
};
