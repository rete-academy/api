# Rete Academy API

### Getting start
```
npm install
```

Develop
```
npm run dev
```

## Usage
1. First, create `.env` with content like  this:
```
# MongoDB config
MONGO_URL=mongodb://<uri>:<port>/<db-name>
MONGO_USER=<user>
MONGO_PASS=<your-password-here>

# Mailgun config
MAILGUN_DOMAIN=<mg.example.com>
MAILGUN_APIKEY=<api-key-here>

# AWS S3 config for upload files
AWS_ACCESS_KEY=<your-access-key>
AWS_SECRET_KEY=<your-secret-key>
AWS_S3_BUCKET='<bucket-name>'

# Google API
GG_CLIENT_ID=<client-id>
GG_CLIENT_SECRET=<client-secret>
GG_PROJECT_ID=<quickstart-1234567>
GG_REDIRECT_URI=http://localhost:8080/google/callback

# Set up for Fb login
FB_APP_ID=<your-app-id>
FB_APP_SECRET=<your-app-secret>
FB_APP_CALLBACK=http://localhost:3000/oauth/facebook/callback
```

## Create new endpoint
Create new file under `/routes/api/` folder.
```
File:                           
  /routes/api/users.js
```

## API
Download `docs/Rete_Academy.postman_collection.json` file, then import it into Postman.
