'use strict';

const router = require('express').Router();
const {
    invalidRequest,
    findAll,
    createSprint,
    updateSprint,
    removeSprint,
    addMaterials,
    removeMaterials,
} = require('controllers/sprints');

module.exports = function (passport) {
    let auth = passport.authenticate(['bearer'], { session: false });

    router.get('', auth, findAll);
    router.post('', auth, createSprint);
    router.put('', auth, invalidRequest);
    router.delete('', auth, invalidRequest);

    router.get('/:id', auth, invalidRequest);
    router.post('/:id', auth, invalidRequest);
    router.put('/:id', auth, updateSprint);
    router.put('/:id/materials', auth, addMaterials);
    router.delete('/:id/materials', auth, removeMaterials);
    router.delete('/:id', auth, removeSprint);

    return router;
};
