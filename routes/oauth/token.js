'use strict';

const router = require('express').Router();
const oauth2 = require('library/oauth2');
const ctrl = require('controllers/tokens');

module.exports = function (passport) {
    let auth = passport.authenticate(['bearer'], { session: false });
    let client_auth = passport.authenticate('client-basic', { session: false });

    router.get('', auth, ctrl.findAll);
    router.post('', client_auth, oauth2.token);
    router.put('', auth, ctrl.invalidRequest);
    router.delete('', auth, ctrl.invalidRequest);

    router.get('/:token', auth, ctrl.find);
    router.post('/:token', auth, ctrl.invalidRequest);
    router.put('/:token', auth, ctrl.invalidRequest);
    router.delete('/:token', auth, ctrl.remove);

    return router;
};