import express from "express";
import session from "express-session";
import passport from "passport";
import swaggerUI from 'swagger-ui-express';
import {swaggerOptions} from "../swagger.mjs";
import swaggerJsDoc from "swagger-jsdoc";
import {PassportDeserializeUser, PassportSerializeUser, PassportStrategy} from "./authentication/passport.mjs";
import {AuthEndpoints} from "./authentication/endpoints.mjs";

export class AuthenticationFeature {
    static enable(__dirname, db) {
        const app = express();
        app.use(session({
            secret: process.env.SESSION_SECRET,
            resave: false,
            saveUninitialized: false
        }));

        app.use(passport.initialize());
        app.use(passport.session({}));

        app.use(express.json());

        passport.use(PassportStrategy(db));
        passport.serializeUser(PassportSerializeUser());
        passport.deserializeUser(PassportDeserializeUser(db));

        app.post("/api/authorize", AuthEndpoints.authorizeUser(db));
        app.post("/api/register", AuthEndpoints.registerUser(db));
        app.post("/api/logout", AuthEndpoints.logout());
        app.get("/api/isAuthorized", AuthEndpoints.isAuthorized());

        AuthenticationFeature.addSwagger(__dirname, app);
        return app;
    }

    static addSwagger(__dirname, app) {
        swaggerOptions.apis.push(__dirname + '/features/authentication/endpoints.mjs');
        const swaggerSpecs = swaggerJsDoc(swaggerOptions);
        app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpecs));
    }
}