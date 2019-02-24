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
        const foundUser = await User.findByUsername(config.default.username);
    
        if (foundUser) {
            log.debug('Found default user, stop.');
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
        const foundClient = await Client.findById(config.default.clientId);
        if (foundClient) {
            log.debug('Found default client, stop.');
            return;
        }
        
        log.debug('Creating new client');
        const newClient = await Client.createNew({
            client_id: randomize('aA0', 32),
            client_secret: randomize('aA0', 64),
        });

        console.log(JSON.stringify(newClient));
        return newClient;
    } catch(error) {
        log.error(`${error.name}: ${error.message}`);
        throw error;
    }
}

module.exports = {
    createFirstUser,
    createFirstClient,
};
