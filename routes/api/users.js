const router = require('express').Router();
const {
  invalidRequest,
  confirmEmail,
  enroll,
  unenroll,
  increaseProgress,
  decreaseProgress,
  findAll,
  findMe,
  uploadAvatar,
  updateUser,
  updateStatus,
  updateProgress,
  createNew,
  remove,
  sendConfirm,
} = require('controllers/users');
const { uploadToS3 } = require('library/aws');
// const { googleAuth } = require('library/google');

module.exports = function (passport) {
  const auth = passport.authenticate(['bearer'], { session: false });
  const authClient = passport.authenticate(['bearer', 'client-basic'], { session: false });

  router.get('', auth, findAll);
  router.get('/profile', auth, findMe);
  router.post('/profile/send-confirm', authClient, sendConfirm);
  router.post('', authClient, createNew);
  router.put('/confirm/:code', authClient, confirmEmail);
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
  router.put('/:userId/update-progress', auth, updateProgress);
  router.delete('/:id', auth, remove);

  return router;
};
