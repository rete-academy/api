module.exports = {
    // Configurations here are default, and work for most cases
    // So in theory, you will not need to modify anything here
    default: {
        username: 'sangdth',
        email: 'sangdth@gmail.com',
        baseUrl: 'http://example.com',
        clientName: 'Default Client',
        clientId: 'gi4ylF2Pk',
        clientSecret: 'pYEpKMZK5bdaf14Ta090n10wi8uy5bAij8',
    },

    debug: {
        // error, warn, info, verbose, debug, silly
        minLevel: 'error',
        maxLevel: 'info',
    },

    email: {
        admin: 'admin@example.com',
        bcc: 'bcc@example.com',
        confirmation: 'confirm@example.com',
        noreply: 'noreply@example.com',
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
