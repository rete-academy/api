'use strict';

const router = require('express').Router();
const {
    invalidRequest,
    getSettings,
    putSettings,
} = require('controllers/settings');
// const { uploadToS3 } = require('library/aws');
// const { googleAuth } = require('library/google');

router.use(function(req, res, next) {
    req.body.client_id = process.env.CLIENT_ID;
    req.body.client_secret = process.env.CLIENT_SECRET;

    next()
});

module.exports = function(passport) {
    let auth = passport.authenticate(['bearer'], { session: false });
    // let authClient = passport.authenticate(['bearer', 'client-basic'], { session: false });

    router.get('', auth, getSettings);
    router.put('', auth, putSettings);
    router.post('', auth, invalidRequest);
    router.delete('', auth, invalidRequest);

    return router;
};
