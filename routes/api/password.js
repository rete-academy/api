'use strict';

const router = require('express').Router();
const ctrl = require('controllers/passwords');

module.exports = function (passport) {
    let auth = passport.authenticate(['basic', 'bearer'], {session: false});
    let auth_reset = passport.authenticate(['password-reset'], {session: false});

    router.get('', auth, ctrl.invalidRequest);
    router.post('', auth, ctrl.invalidRequest);
    router.put('', auth, ctrl.invalidRequest);
    router.delete('', auth, ctrl.invalidRequest);

    router.post('/forgot', ctrl.forgot);
    router.post('/reset', auth_reset, ctrl.reset);

    router.get('/:id', auth, ctrl.invalidRequest);
    router.post('/:id', auth, ctrl.invalidRequest);
    router.put('/:id', auth, ctrl.invalidRequest);
    router.delete('/:id', auth, ctrl.invalidRequest);

    return router;
};
