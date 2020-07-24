const router = require('express').Router();
const {
  invalidRequest,
  findAll,
  findSlug,
  enroll,
  unenroll,
  createPath,
  updatePath,
  removePath,
  addSprints,
  removeSprints,
} = require('controllers/paths');

module.exports = function (passport) {
  // let authClient = passport.authenticate(['client-basic', 'bearer'], { session: false });
  const auth = passport.authenticate(['bearer'], { session: false });

  router.get('', findAll);
  router.get('/:slug', findSlug);
  router.post('', auth, createPath);
  router.put('', auth, invalidRequest);
  router.delete('', auth, invalidRequest);

  router.get('/:id', auth, invalidRequest);
  router.post('/:id', auth, invalidRequest);
  router.put('/:id', auth, updatePath);
  router.delete('/:id', auth, removePath);

  router.put('/:id/add-sprints', auth, addSprints);
  router.put('/:id/remove-sprints', auth, removeSprints);
  router.put('/:id/enroll', auth, enroll);
  router.put('/:id/unenroll', auth, unenroll);

  return router;
};
