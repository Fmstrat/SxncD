import bodyParser from "body-parser";
import { update } from "./api/v1/sync/update.js";
import { initModules } from "./auth.js";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./api/v1/swagger.json" assert { type: "json" };
import { getConfig } from "../common/config.js";

import express from "express";
import session from "express-session";
import MemoryStore from "memorystore";
import passport from "passport";
import { refresh } from "./refresh.js";
import { logRequest } from "./logging.js";

async function render(view, res, config) {
    try {
        res.render(view, {
            config,
        });
    } catch (e) {
        console.error(e);
    }
}

async function renderPrivate(view, req, res, config) {
    try {
        if (!req.user) {
            return res.redirect('/');
        }
        res.render(view, {
            config,
            user: req.user,
        });
    } catch (e) {
        console.error(e);
    }
}

export async function initHTTP(app) {
    const config = await getConfig();

    passport.serializeUser(function (user, done) {
        done(null, user);
    });
    passport.deserializeUser(function (user, done) {
        done(null, user);
    });

    const memoryStore = MemoryStore(session);
    const sess = {
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: false,
        store: new memoryStore({
            checkPeriod: 86400000 // prune expired entries every 24h
        }),
        cookie: {},
    }
    if (app.get('env') === 'production') {
        app.set('trust proxy', 1) // trust first proxy
        sess.cookie.secure = true // serve secure cookies
    }
    app.use(session(sess));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(express.static("./http/public"));

    app.set('views', './http/views');
    app.set('view engine', 'ejs');

    await initModules(app, passport);
    logRequest(app);

    app.get("/", (req, res) => render('login', res, config));
    app.get("/dashboard", (req, res) => renderPrivate('dashboard', req, res, config));
    app.get("/refresh", refresh);

    app.post("/api/v1/sync/update", bodyParser.json(), update);
    app.use("/api/v1", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}
