module.exports = {
    // Configurations here are default, and work for most cases
    // So in theory, you will not need to modify anything here
    default: {
        username: 'sangdth',
        email: 'sangdth@gmail.com',
        baseUrl: 'https://api.rete.academy',
        webUrl: 'https://www.rete.academy',
    },

    log: {
        // error, warn, info, verbose, debug, silly
        maxLevel: 'warn',
    },

    email: {
        admin: 'admin@rete.academy',
        bcc: 'sangdth@gmail.com',
        confirmation: 'noreply@rete.academy',
        noreply: 'noreply@rete.academy',
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
    },
};
