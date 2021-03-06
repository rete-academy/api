const router = require('express').Router();
const {
  confirmEmail,
  createNew,
  decreaseProgress,
  enroll,
  findAll,
  findByUsername,
  findMe,
  increaseProgress,
  invalidRequest,
  remove,
  sendConfirm,
  unenroll,
  updateStatus,
  updateUser,
  uploadAvatar,
} = require('controllers/users');
const { uploadToS3 } = require('library/aws');
// const { googleAuth } = require('library/google');

module.exports = function (passport) {
  const auth = passport.authenticate(['bearer'], { session: false });
  // const authClient = passport.authenticate(['client'], { session: false });

  router.get('', auth, findAll);
  router.get('/profile', auth, findMe);
  router.get('/:username', auth, findByUsername);
  router.post('/profile/send-confirm', sendConfirm);
  router.post('', createNew);
  router.put('/confirm/:code', confirmEmail);
  router.put('', auth, invalidRequest);
  router.delete('', auth, invalidRequest);

  router.post('/:id', auth, invalidRequest);
  router.post('/:id/avatar', auth, uploadToS3.single('avatar'), uploadAvatar);
  router.put('/:id', auth, updateUser);
  router.put('/:id/enroll', auth, enroll);
  router.put('/:id/unenroll', auth, unenroll);
  router.put('/:id/increase', auth, increaseProgress);
  router.put('/:id/decrease', auth, decreaseProgress);
  router.put('/:userId/update-status', auth, updateStatus);
  router.delete('/:id', auth, remove);

  return router;
};
