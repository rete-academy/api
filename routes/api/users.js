'use strict';

const router = require('express').Router();
const {
    invalidRequest,
    confirmEmail,
    findAll,
    findMe,
    upload,
    updateUser,
    updateStatus,
    updateProgress,
    createNew,
    remove,
    sendConfirm,
} = require('controllers/users');
const { uploadToS3 } = require('library/upload');
// const { googleAuth } = require('library/google');

router.use(function(req, res, next) {
    req.body.client_id = process.env.CLIENT_ID;
    req.body.client_secret = process.env.CLIENT_SECRET;

    next()
});

module.exports = function(passport) {
    let auth = passport.authenticate(['bearer'], { session: false });
    let authClient = passport.authenticate(['bearer', 'client-basic'], { session: false });

    router.get('', auth, findAll);
    router.get('/profile', auth, findMe);
    router.post('/profile/send-confirm', authClient, sendConfirm);
    router.post('', authClient, createNew);
    router.put('/confirm/:code', authClient, confirmEmail);
    router.put('', auth, invalidRequest);
    router.delete('', auth, invalidRequest);

    // router.get('/:id', auth, ctrl.find);
    router.post('/:id', auth, invalidRequest);
    router.post('/:id/upload', auth, uploadToS3.single('avatar'), upload);
    router.put('/:id', auth, updateUser);
    router.put('/:userId/update-status', auth, updateStatus);
    router.put('/:userId/update-progress', auth, updateProgress);
    router.delete('/:id', auth, remove);

    return router;
};
