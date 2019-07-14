# google-oauth-middleware

Express/connect middleware to authenticate with Google OAuth. No Passport pre-req.

This is better than passport in some cases such as needing to authenticate multiple Google accounts to use.

## Install
```bash
npm i "google-oauth-middleware"
```

## Usage
```ts
// the redirect path
const redirectPath = '/auth/google/callback';
const creds = {
    "clientId": "CLIENT_ID",
    "clientSecret": "CLIENT_SECRET",
    "redirectUri": `http://example.com${redirectPath}`
};

// setup the authenticator
const googleOAuth = require('google-oauth-middleware')(creds,
    async (credentials, profile, next) => {
        // store creds in db or however you want to use them
        GoogleAccount
            .addAsync(credentials, profile)
            .then(() => next(), next);
    }
);

// redirects to Google OAuth Consent Screen
// you can also define multiple .authenticate(scope)
// to authenticate with different scopes
app.get('/addGoogleAccount', googleOAuth.authenticate({
    scope: [
        'profile',
        'email',
        'openid',
        // add your scopes here
    ]
}));

// this is triggered on authentication from Google
app.get(redirectPath,
    // this triggers the authenticator
    googleOAuth.authenticate(),

    // success
    (req, res, next) => {
        // do something on success
    },

    // fail (this will be triggered when error handling
    // the credentials in the googleOAuth i.e. adding to db)
    (err, req, res, next) => {
        // handle error here somehow
    }
);
```