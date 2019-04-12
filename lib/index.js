'use strict';

// G+ API is deprecated so hard luck
const USER_PROFILE_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';

const {
    google
} = require('googleapis');

function authenticator(googleCreds, onSuccessLogin) {
    if (typeof onSuccessLogin !== 'function') {
        throw new Error('onSuccessLogin needs to be a function');
    }

    function createGoogleOauthClient() {
        return new google.auth.OAuth2(googleCreds);
    }

    function login({
        scope,
        prompt,
        hd
    }) {
        return (_req, res) => {
            const googleUrl = createGoogleOauthClient()
                .generateAuthUrl({
                    access_type: 'offline',
                    prompt: prompt || 'consent',
                    scope,
                    hd
                });

            res.redirect(googleUrl);
        };
    }

    function oAuthCallback() {
        return async (req, _res, next) => {
            try {
                const {
                    code
                } = req.query;

                if (!code) {
                    throw new Error('no code received');
                }

                const auth = createGoogleOauthClient();
                const {
                    tokens: credentials
                } = await auth.getToken(code);
                auth.setCredentials(credentials);

                const rawProfile = (await auth.request({
                    url: USER_PROFILE_URL
                })).data;

                // extract needed data
                const {
                    id,
                    sub,
                    email,
                    name: displayName,
                    given_name: givenName,
                    family_name: familyName,
                    picture
                } = rawProfile;

                const profile = {
                    id: (typeof id !== 'undefined' ? id : sub),
                    displayName,
                    name: {
                        givenName,
                        familyName
                    },
                    email,
                    picture,
                    _raw: rawProfile
                };

                onSuccessLogin(credentials, profile, next);
            } catch (e) {
                next(e);
            }
        }
    }

    function authenticate(opts) {
        return (opts && opts.scope ? login : oAuthCallback)(opts);
    }

    return {
        authenticate
    };
}

module.exports = authenticator;