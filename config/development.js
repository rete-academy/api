module.exports = {
    // Configurations here are default, and work for most cases
    // So in theory, you will not need to modify anything here
    default: {
        username: 'sangdth',
        email: 'sangdth@gmail.com',
        baseUrl: 'http://localhost',
        webUrl: 'http://localhost:8080',
    },

    log: {
        // error, warn, info, verbose, debug, silly
        maxLevel: 'silly',
    },

    email: {
        admin: 'admin@example.com',
        bcc: 'bcc@example.com',
        confirmation: 'confirm@example.com',
        noreply: 'noreply@example.com',
        welcome: {
            subject: 'Welcome to Rete Academy',
            text: 'Welcome to Rete Academy',
            content: 'Here is the content of the welcome email. Edit in config.',
        },
    },

    limit: {
        oauthWindow: 3600000,
        oauthMax: 20000,
        apiWindow: 60000,
        apiMax: 50000,
        oauthDelay: 0,
        apiDelay: 0,
        tokenLife: 2592000,
        codeLife: 2592000,
    },
};