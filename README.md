# Template API

### Getting start
```
npm install
```

Develop
```
npm run dev
```
## Create new endpoint
Create new file under `/routes/api/` folder. File name will be the path.
```
File:                           Endpoint:
  /routes/api/users.js            /api/users
  /routes/api/clients.js          /api/clients
  /routes/oauth/token.js          /oauth/token
```

## Usage
1. Create `.env`
You can either create .env or setting up environment variables. Here are the list:
```
# Set up for Fb login
FB_APP_ID=<your-app-id>
FB_APP_SECRET=<your-app-secret>
FB_APP_CALLBACK=http://localhost:3000/oauth/facebook/callback

# MongoDB config
MONGO_URL=mongodb://<uri>:<port>/<db-name>
MONGO_USER=admin
MONGO_PASS=<your-password-here>

# Mailgun config
MAILGUN_DOMAIN=mailgun.example.com
MAILGUN_APIKEY=<api-key-here>

# AWS S3 config for upload
AWS_ACCESS_KEY=<your-access-key>
AWS_SECRET_KEY=<your-secret-key>
AWS_S3_BUCKET='<bucket-name>'
```

## API

### Authentication
This endpoint using for sign in and registration.

#### HTTP Request
`POST http://example.com/oauth/token`

### Users
This endpoint using for users list

#### HTTP Request
`GET http://example.com/api/user`
