import express, {Application} from "express";
import session from "express-session";
import passport, {SessionOptions} from "passport";
import swaggerUI from 'swagger-ui-express';
import {swaggerOptions} from "../swagger.js";
import swaggerJsDoc from "swagger-jsdoc";
import {PassportDeserializeUser, PassportSerializeUser, PassportStrategy} from "./authentication/passport.js";
import {AuthEndpoints} from "./authentication/endpoints";
import {AuthActions} from "./authentication/actions";
import {MariaDbDatabase} from "./database/mariaDbDatabase.js";
import path from "path";
import {CLI} from "../tooling/CLI";

export class AuthenticationFeature {
    static enable(__dirname: string, db: MariaDbDatabase) {
        const app = express();
        app.use(session({
            secret: process.env.SESSION_SECRET || "secret",
            resave: false,
            saveUninitialized: false
        }));

        app.use(passport.initialize());
        app.use(passport.session(<SessionOptions>{}));

        app.use(express.json());

        passport.use(PassportStrategy(db));
        passport.serializeUser(PassportSerializeUser());
        passport.deserializeUser(PassportDeserializeUser(db));

        app.post("/api/authorize", AuthEndpoints.authorizeUser(db));
        app.post("/api/register", AuthEndpoints.registerUser(db));
        app.post("/api/updateUser", AuthEndpoints.updateUser(db));
        app.post("/api/logout", AuthEndpoints.logout());
        app.get("/api/getUser", AuthActions.checkAuthenticated, AuthEndpoints.getUser());
        app.post("/api/updateUser", AuthActions.checkAuthenticated, AuthEndpoints.updateUser(db));

        // Permissions and roles
        app.get("/api/permissions", AuthEndpoints.getAllPermissions(db));
        app.get("/api/rolePermissions", AuthEndpoints.getRolePermissions(db));
        app.get("/api/roles", AuthEndpoints.getAllRoles(db));
        app.post("/api/createRole", AuthActions.checkAuthenticated, AuthEndpoints.createRole(db));
        app.post("/api/addPermissionToRole", AuthActions.checkAuthenticated, AuthEndpoints.addPermissionToRole(db));
        app.get("/api/getUserPermissions", AuthActions.checkAuthenticated, AuthEndpoints.getUserPermissions(db));
        app.get("/api/getUserRoles", AuthActions.checkAuthenticated, AuthEndpoints.getUserRoles(db));
        app.post("/api/addRoleToUser", AuthActions.checkAuthenticated, AuthEndpoints.addRoleToUser(db));

        AuthenticationFeature.addSwagger(__dirname, app);
        return app;
    }

    static addSwagger(__dirname: string, app: Application) {
        const endpointsPath = path.join(__dirname, 'features/authentication/endpoints.js');
        CLI.debug(endpointsPath);
        swaggerOptions.apis.push(endpointsPath);
        const swaggerSpecs = swaggerJsDoc(swaggerOptions);
        app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpecs));
    }
}