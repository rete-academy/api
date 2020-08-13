const fs = require('fs-extra');
const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');
// const config = require('config');
const log = require('library/logger');

const adminTemplate = 'library/email/admin.html';
const welcomeTemplate = 'library/email/welcome.html';
const resetTemplate = 'library/email/reset.html';
const generalTemplate = 'library/email/general.html';

const mailgunOptions = {
  auth: {
    api_key: process.env.MAILGUN_APIKEY,
    domain: process.env.MAILGUN_DOMAIN,
  },
};

// EmailService
class EmailService {
  constructor() {
    this.emailClient = nodemailer.createTransport(mg(mailgunOptions));
  }

  sendMail({
    from, to, subject, text, placeholders, type,
  }) {
    log.silly(`Start sending email to: ${to}`);

    return async () => {
      let html = '';

      switch (type) {
        case 'admin':
          html = await fs.readFile(adminTemplate); break;
        case 'general':
          html = await fs.readFile(generalTemplate); break;
        case 'welcome':
          html = await fs.readFile(welcomeTemplate); break;
        case 'reset':
          html = await fs.readFile(resetTemplate); break;
        default:
          html = await fs.readFile(generalTemplate); break;
      }

      const keys = Object.keys(placeholders);

      keys.forEach((key) => {
        if (placeholders[key]) {
          html = html.toString().replace(key, placeholders[key]);
        }
      });

      const mailOptions = {
        from, to, subject, text, html,
      };

      this.emailClient.sendMail(mailOptions, (error, info) => {
        if (error) {
          log.error(error.message);
          log.silly(`Sent email to ${to} failed.`);
          return error;
        }

        log.debug(info);
        log.silly(`Sent email to ${to} successfully.`);
        return info;
      });
    };
  }
}

module.exports = new EmailService();
