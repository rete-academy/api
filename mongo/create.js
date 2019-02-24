'use strict';

// const fs = require('fs');
// const readline = require('readline');
const randomize = require('randomatic');
const config = require('config');
const User = require('mongo/model/user');
const Client = require('mongo/model/client');
const log = require('library/logger');

async function createFirstUser() {
    try {
        const foundUsers = await User.find();
    
        if (foundUsers.length > 0) {
            log.debug('Found some user(s), stop.');
            return;
        }

        log.debug('Creating new user: ' + config.default.username);
        return await User.createNew({
            username: config.default.username,
            email: config.default.email,
            role: [0],
            status: 1,
            password: randomize('aA0!', 16),
        });
    } catch(error) {
        log.error(`${error.name}: ${error.message}`);
        throw error;
    }
}

async function createFirstClient() {
    try {
        const foundClients = await Client.find();
        if (foundClients) {
            log.debug('Found some client(s), stop.');
            return;
        }
        
        log.debug('Creating new client');
        return await Client.createNew({
            client_id: randomize('aA0', 32),
            client_secret: randomize('aA0', 64),
        });

        // console.log(JSON.stringify(newClient));
    } catch(error) {
        log.error(`${error.name}: ${error.message}`);
        throw error;
    }
}

module.exports = {
    createFirstUser,
    createFirstClient,
};
