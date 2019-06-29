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
  let authClient = passport.authenticate(['bearer', 'client-basic'], { session: false });
  let auth = passport.authenticate(['bearer'], { session: false });

  router.get('', authClient, findAll);
  router.post('', auth, createSprint);
  router.put('', auth, invalidRequest);
  router.delete('', auth, invalidRequest);

  router.get('/:id', auth, invalidRequest);
  router.post('/:id', auth, invalidRequest);
  router.put('/:id', auth, updateSprint);
  router.put('/:id/add-materials', auth, addMaterials);
  router.put('/:id/remove-materials', auth, removeMaterials);
  router.delete('/:id', auth, removeSprint);

  return router;
};
