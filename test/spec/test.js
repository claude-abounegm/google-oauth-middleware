'use strict';

const googleAuthenticator = require('../..');

describe('authenticator', function() {
    it('should work', async function() {
        const googleOAuth = googleAuthenticator(
            {
                clientId: 'CLIENT_ID',
                clientSecret: 'CLIENT_SECRET',
                redirectUri: `http://example.com/auth/google/callback`
            },
            async (credentials, profile, next) => {
                console.log(credentials);

                next();
            }
        );

        googleOAuth.authenticate();
    });
});
