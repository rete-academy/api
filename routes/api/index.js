'use strict';

const fs = require('fs');
const router = require('express').Router();

// In future when we can do proxy, remove this code
router.use(function(req, res, next) {
    req.body.client_id = process.env.CLIENT_ID;
    req.body.client_secret = process.env.CLIENT_SECRET;

    next()
});

module.exports = function (passport) {
    fs.readdir('./routes/api', (err, files) => {
        files.forEach(file => {
            if (file !== 'index.js') {
                router.use(`/${file.slice(0, -3)}/`, require(`./${file}`)(passport));
            }
        });
    });

    return router;
};
