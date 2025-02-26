import OpenIDConnectStrategy from "passport-openidconnect";
import { checkUser } from "../../http/auth.js";
import { getConfig } from "../../common/config.js";

const key = 'oidc';

export function getModuleConfig() {
    return {
        title: 'OpenID Connect',
        icon: 'login',
        issuer: process.env.OIDC_ISSUER,
        authorizationURL: process.env.OIDC_AUTHORIZATION_URL,
        tokenURL: process.env.OIDC_TOKEN_URL,
        userInfoURL: process.env.OIDC_USERINFO_URL,
        clientID: process.env.OIDC_CLIENT_ID,
        clientSecret: process.env.OIDC_CLIENT_SECRET,
        callbackURL: `${process.env.PUBLIC_URL}/callback/${key}`,
    }
}

export async function initModule(app, passport) {
    const config = getConfig();

    passport.use(new OpenIDConnectStrategy(
        config.authModules[key],
        function verify(issuer, profile, cb) {
            (async () => {
                try {
                    const user = await checkUser(issuer, profile.id, profile.username);
                    return cb(null, user);
                } catch (e) {
                    if (config.debug)
                        console.error(e);
                    return cb(null, null);
                }
            })();
        }
    ));
    app.get(`/login/${key}`, passport.authenticate('openidconnect'));
    app.get(`/callback/${key}`,
        passport.authenticate('openidconnect', {
            failureRedirect: '/',
            failureMessage: true
        }),
        function (req, res) {
            res.redirect('/dashboard');
        }
    );    
}