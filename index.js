require('dotenv').config();
require('app-module-path').addPath(__dirname);

const app = require('express')();
const bodyParser = require('body-parser');
const config = require('config');
const cors = require('cors');
const helmet = require('helmet')();
const log = require('library/logger');
const passport = require('passport');
const sentry = require('@sentry/node');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongo/db');

// const server = require('http').createServer(app);
// ha ha ha it works
const { ApolloServer, gql } = require('apollo-server-express');

const typeDefs = gql`
  type Query {
    hello: String
  }
`;

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    hello: () => 'Hello world!',
  },
};

const server = new ApolloServer({ typeDefs, resolvers });
const io = require('socket.io')(server);

sentry.init({ dsn: 'https://7a23e0719d964b6ea1252e9912d5e0f0@sentry.io/1401406' });

app.use(sentry.Handlers.requestHandler());
app.use(sentry.Handlers.errorHandler());

require('library/passport')(passport);

app.use(helmet);

app.use(cors());

const sessOptions = {
  cookie: { secure: true },
  resave: false,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
  }),
};

if (app.get('env') === 'production') {
  app.set('trust proxy', 1); // trust first proxy
  sessOptions.cookie.secure = true; // serve secure cookies
}
app.use(session(sessOptions));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(passport.initialize());
app.use((req, res, next) => {
  req.io = io; // add io into req so controllers can use it
  next();
});

require('routes/index')(app, passport);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500).send({
    success: false,
    message: `Internal Server Error. ${err.message}`,
  });
});

const port = process.env.PORT || 8000;

// start HTTP server
app.listen({ port }, () => {
  log.info(`⚡️ Server runs on: ${config.default.baseUrl}`);
  log.info(`🚀 GraphQL server: http://localhost:${port}${server.graphqlPath}`);
}).on('error', (err) => {
  if (err.errno === 'EADDRINUSE') log.error(err);
  else log.error('Something wrong');
});
