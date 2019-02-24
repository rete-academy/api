'use strict';

const router = require('express').Router();
const {
    invalidRequest,
    confirmEmail,
    findAll,
    findMe,
    upload,
    updateUser,
    updateMaterialStatus,
    createNew,
    remove,
} = require('controllers/users');
const { uploadToS3 } = require('library/upload');
// const { googleAuth } = require('library/google');

module.exports = function(passport) {
    let auth = passport.authenticate(['bearer'], { session: false });
    let authClient = passport.authenticate(['bearer', 'client-basic'], { session: false });

    router.get('', auth, findAll);
    router.get('/profile', auth, findMe);
    router.post('', authClient, createNew);
    router.put('/confirm/:code', authClient, confirmEmail);
    router.put('', auth, invalidRequest);
    router.delete('', auth, invalidRequest);

    // router.get('/:id', auth, ctrl.find);
    router.post('/:id', auth, invalidRequest);
    router.post('/:id/upload', auth, uploadToS3.single('avatar'), upload);
    router.put('/:id', auth, updateUser);
    router.put('/:userId/materials/:materialId', auth, updateMaterialStatus);
    router.delete('/:id', auth, remove);

    return router;
};
