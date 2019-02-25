'use strict';

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

router.use(function(req, res, next) {
    req.body.client_id = process.env.CLIENT_ID;
    req.body.client_secret = process.env.CLIENT_SECRET;

    next()
});

module.exports = function (passport) {
    let authClient = passport.authenticate(['bearer', 'client-basic'], { session: false });
    let auth = passport.authenticate(['bearer'], { session: false });

    router.get('', authClient, findAll);
    router.get('/:slug', authClient, findSlug);
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
