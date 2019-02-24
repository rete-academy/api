const { google } = require('googleapis');

// If modifying these scopes, delete token.json.
const defaultScopes = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/classroom.courses',
    'https://www.googleapis.com/auth/classroom.courses.readonly',
];

const googleConfigs = {
    client_id: process.env.GG_CLIENT_ID,
    client_secret: process.env.GG_CLIENT_SECRET,
    redirect_uri: process.env.GG_REDIRECT_URI,
};

/**
 * Create an OAuth2 client with the given credentials
 */
const oauth2Client = new google.auth.OAuth2(
    googleConfigs.client_id,
    googleConfigs.client_secret,
    googleConfigs.redirect_uri,
);

/**
 * Get a url which will open the google sign-in page and
 * request access to the scope provided
 */
const getConnectionUrl = (scopes = []) => {
    try {
        return oauth2Client.generateAuthUrl({
            access_type: 'offline',
            prompt: 'consent', // force new refresh token
            scope: defaultScopes.concat(scopes).join(' '),
        });
    } catch (err) {
        throw err;
    }
};

/**
 * Get and store new token after prompting for user authorization
 */
const getAccessToken = async (code) => {
    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Get user profile
        const oauth2 = google.oauth2({
            auth: oauth2Client,
            version: 'v2'
        });
        const { data } = await oauth2.userinfo.get();
        // Merge tokens and user profile then return
        return { tokens, profile: data };
    } catch (err) {
        throw err;
    }
};

const authoriseGoogle = async (session) => {
    // console.log({ tokens: session.tokens });
    try {
        if (session && session.tokens) {
            const tokens = session.tokens;
            // Check the token valid or not
            oauth2Client.setCredentials(tokens);
            const authed = await oauth2Client.getTokenInfo(tokens.access_token);
            // console.log({ authed });
            return authed;
        }
        return null;
    } catch (err) {
        throw err;
    }
};

module.exports = {
    authoriseGoogle,
    getConnectionUrl,
    getAccessToken,
};
