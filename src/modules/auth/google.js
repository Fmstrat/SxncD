import GoogleStrategy from "passport-google-oauth20";
import { checkUser } from "../../http/auth.js";
import { getConfig } from "../../common/config.js";

const key = 'google';

export function getModuleConfig() {
    return {
        title: 'Google',
        icon: 'language',
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.PUBLIC_URL}/callback/${key}`,
    }
}

export async function initModule(app, passport) {
    const config = getConfig();
    passport.use(new GoogleStrategy.Strategy(
        config.authModules[key],
        function (accessToken, refreshToken, profile, cb) {
            console.log(JSON.stringify(profile, null, 2));
            (async () => {
                try {
                    const photo = profile.photos?.length > 0 ? profile.photos[0].value : null;
                    const user = await checkUser('https://google.com', profile.id, profile.displayName, photo);
                    return cb(null, user);
                } catch (e) {
                    if (config.debug)
                        console.error(e);
                    return cb(null, null);
                }
            })();
        }
    ));
    app.get(`/login/${key}`, passport.authenticate('google', { scope: ['profile'] }));
    app.get(`/callback/${key}`,
        passport.authenticate('google', {
            failureRedirect: '/',
            failureMessage: true
        }),
        function (req, res) {
            res.redirect('/dashboard');
        }
    );
}