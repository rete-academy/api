'use strict';

const router = require('express').Router();
const {
    // invalidRequest,
    // findAll,
    uploadSingle,
} = require('controllers/files');
const { uploadToS3 } = require('library/upload');

router.use(function(req, res, next) {
    req.body.client_id = process.env.CLIENT_ID;
    req.body.client_secret = process.env.CLIENT_SECRET;

    next()
});

module.exports = function(passport) {
    let auth = passport.authenticate(['bearer'], { session: false });

    router.post('/upload', auth, uploadToS3.single('file'), uploadSingle);

    return router;
};
