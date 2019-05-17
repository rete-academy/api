'use strict';

// const fs = require('fs');
// const readline = require('readline');
const randomize = require('randomatic');
const config = require('config');
const User = require('mongo/model/user');
const Client = require('mongo/model/client');
const emailService = require('library/email');
const log = require('library/logger');

async function createAdmin() {
    try {
        const foundUsers = await User.find();
        const foundClients = await Client.find();

        if (foundUsers.length > 0 && foundClients.length > 0) {
            log.debug('Found admin user, stop.');
            return;
        }

        const password = randomize('aA0!', 16);
        const clientId = randomize('aA0', 32);
        const clientSecret = randomize('aA0', 64);

        log.debug('Creating first user: ' + config.default.username);
        await User.createNew({
            username: config.default.username,
            email: config.default.email,
            role: [0],
            status: 1,
            password: password,
        });

        log.debug('Creating new client');
        await Client.createNew({
            client_id: clientId,
            client_secret: clientSecret,
        });

        await emailService.sendMail({
            from: config.email.noreply,
            to: config.default.email,
            subject: 'Admin credentials, keep in safe place',
            text: 'Admin credentials, keep in safe place',
            placeholders: {
                TITLE: 'ADMIN CREDENTIALS',
                PASSWORD: password,
                CLIENT_ID: clientId,
                CLIENT_SEC: clientSecret,
            },
            type: 'admin',
        });
    } catch(error) {
        log.error(`${error.name}: ${error.message}`);
        throw error;
    }
}

module.exports = { createAdmin };
