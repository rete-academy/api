'use strict';

require('dotenv').config();
require('app-module-path').addPath(__dirname);

const app  = require('express')();
const cors = require('cors');
const Sentry = require('@sentry/node');
const session = require('express-session');
const helmet = require('helmet')();
const bodyParser = require('body-parser');
const passport = require('passport');
const config = require('config');

Sentry.init({ dsn: 'https://7a23e0719d964b6ea1252e9912d5e0f0@sentry.io/1401406' });
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());

const log = require('library/logger');

require('library/passport')(passport);
require('mongo/db');

app.use(helmet);
app.use(cors({ origin: config.default.webUrl }));

const sessOptions = {
    secret: process.env.CLIENT_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {}
};
if (app.get('env') === 'production') {
    app.set('trust proxy', 1) // trust first proxy
    sessOptions.cookie.secure = true // serve secure cookies
}
app.use(session(sessOptions));

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(passport.initialize());

require('routes/index')(app, passport);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    res.status(err.status || 500).send({
        success: false,
        message: 'Internal Server Error. ' + err.message,
    });
});

let server = require('http').createServer(app);
let port = process.env.PORT || 3000;

// start HTTP server
server.listen(port, () => {
    log.info(`App runs on: ${config.default.baseUrl}:${port}`);
}).on('error', (err) => {
    if (err.errno === 'EADDRINUSE') {
        log.error(err);
    } else {
        log.error('Something wrong');
    }
});

// process.on('unhandledRejection', (reason, p) => {
// });
