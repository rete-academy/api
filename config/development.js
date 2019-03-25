module.exports = {
    // Configurations here are default, and work for most cases
    // So in theory, you will not need to modify anything here
    default: {
        username: 'sangdth',
        email: 'sangdth@gmail.com',
        baseUrl: 'http://localhost:8000',
        webUrl: 'http://localhost:3000',
    },

    log: {
        // error, warn, info, verbose, debug, silly
        maxLevel: 'silly',
    },

    email: {
        bcc: 'bcc@example.com',
        confirmation: 'confirm@example.com',
        admin: {
            name: 'Rete Academy',
            address: 'admin@example.com',
        },
        noreply: {
            name: 'Rete Academy',
            address: 'noreply@example.com',
        },
        welcome: {
            subject: 'Welcome to Rete Academy',
            text: 'Welcome to Rete Academy',
            content: 'Welcome to Rete Academy.',
        },
        reset: {
            subject: 'Reset your password',
            text: 'Reset your password',
            content: 'Reset your password',
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
        fileCache: 31536000,
    },
};
