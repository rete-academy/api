const randomize = require('randomatic');
const config = require('config');
const User = require('mongo/model/user');
const Client = require('mongo/model/client');

const emailService = require('library/email');
const log = require('library/logger');

async function createAdmin() {
  const foundUsers = await User.find();
  const foundClients = await Client.find();

  if (foundUsers.length === 0) {
    const password = randomize('aA0!', 16);

    await User.createNew({
      username: config.default.username,
      email: config.default.email,
      role: [0],
      status: 1,
      password,
    });

    log.debug('Created first user');

    await emailService.sendMail({
      from: config.email.noreply,
      to: config.default.email,
      subject: 'Admin credentials, keep in safe place',
      text: 'Admin credentials, keep in safe place',
      placeholders: {
        TITLE: 'ADMIN CREDENTIALS',
        PASSWORD: password,
      },
      type: 'admin',
    });

    log.debug(`Sent email to ${config.default.email}`);
  }

  if (foundClients.length === 0) {
    await Client.createNew({
      client_id: randomize('aA0', 32),
      client_secret: randomize('aA0', 64),
    });

    log.debug('Created first client');
  }
}

module.exports = { createAdmin };
