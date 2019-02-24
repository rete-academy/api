'use strict';

const router = require('express').Router();
const ctrl = require('../../controllers/clients');

module.exports = function(passport) {
    let auth = passport.authenticate(['bearer'], { session: false });

    router.get('', auth, ctrl.findAll);
    router.post('', auth, ctrl.invalidRequest);
    router.put('', auth, ctrl.invalidRequest);
    router.delete('', auth, ctrl.invalidRequest);

    router.get('/:id', auth, ctrl.invalidRequest);
    router.post('/:id', auth, ctrl.invalidRequest);
    router.put('/:id', auth, ctrl.invalidRequest);
    router.delete('/:id', auth, ctrl.invalidRequest);

    return router;
};
