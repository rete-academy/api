const router = require('express').Router();
const {
  invalidRequest,
  createNew,
  findById,
  addMessage,
  remove,
} = require('controllers/conversations');
// const { googleAuth } = require('library/google');

module.exports = function (passport) {
  const auth = passport.authenticate(['bearer'], { session: false });

  router.get('', auth, invalidRequest);
  router.post('', auth, createNew);
  router.put('', auth, invalidRequest);
  router.delete('', auth, invalidRequest);

  router.get('/:id', auth, findById);
  router.post('/:id', auth, invalidRequest);
  router.put('/:id', auth, invalidRequest);
  router.put('/:id/messages', auth, addMessage);
  router.delete('/:id', auth, remove);

  return router;
};
