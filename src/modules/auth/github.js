import GitHubStrategy from "passport-github";
import { checkUser } from "../../http/auth.js";
import { getConfig } from "../../common/config.js";

const key = 'github';

export function getModuleConfig() {
    return {
        title: 'GitHub',
        icon: 'code',
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: `${process.env.PUBLIC_URL}/callback/${key}`,
    }
}

export async function initModule(app, passport) {
    const config = getConfig();

    passport.use(new GitHubStrategy(
        config.authModules[key],
        function (accessToken, refreshToken, profile, cb) {
            (async () => {
                try {
                    const user = await checkUser('https://github.com', profile.id, profile.username);
                    return cb(null, user);
                } catch (e) {
                    if (config.debug)
                        console.error(e);
                    return cb(null, null);
                }
            })();
        }
    ));
    app.get(`/login/${key}`, passport.authenticate('github'));
    app.get(`/callback/${key}`,
        passport.authenticate('github', {
            failureRedirect: '/',
            failureMessage: true
        }),
        function (req, res) {
            res.redirect('/dashboard');
        }
    );    
}