'use strict';

const router = require('express').Router();
const {
    invalidRequest,
    findAll,
    createMaterial,
    updateMaterial,
    removeMaterial,
} = require('controllers/materials');

module.exports = function (passport) {
    let auth = passport.authenticate(['bearer'], { session: false });
    let authClient = passport.authenticate(['bearer', 'client-basic'], { session: false });

    router.get('', authClient, findAll);
    router.post('', auth, createMaterial);
    router.put('', auth, invalidRequest);
    router.delete('', auth, invalidRequest);

    router.get('/:id', auth, invalidRequest);
    router.post('/:id', auth, invalidRequest);
    router.put('/:id', auth, updateMaterial);
    router.delete('/:id', auth, removeMaterial);

    return router;
};
