import express, {Application} from "express";
import session from "express-session";
import passport, {SessionOptions} from "passport";
import {PassportDeserializeUser, PassportSerializeUser, PassportStrategy} from "./authentication/passport.js";
import {AuthEndpoints} from "./authentication/endpoints";
import {AuthActions} from "./authentication/actions";
import {MariaDbDatabase} from "./database/mariaDbDatabase.js";

export class AuthenticationFeature {
    static enable(__dirname: string, app: Application, db: MariaDbDatabase) {
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

        const prefix = "/api/auth";
        app.post(`${prefix}/authorize`, AuthEndpoints.authorizeUser(db));
        app.post(`${prefix}/register`, AuthEndpoints.registerUser(db));
        app.post(`${prefix}/logout`, AuthEndpoints.logout());
        app.get(`${prefix}/getUser`, AuthActions.checkAuthenticated, AuthEndpoints.getUser());
        app.patch(`${prefix}/updateUser`, AuthActions.checkAuthenticated, AuthEndpoints.updateUser(db));
        app.delete(`${prefix}/deleteUser`, AuthActions.checkAuthenticated, AuthEndpoints.deleteUser(db));

        // Permissions and roles
        app.get(`${prefix}/permissions`, AuthEndpoints.getAllPermissions(db));
        app.get(`${prefix}/rolePermissions`, AuthEndpoints.getRolePermissions(db));
        app.get(`${prefix}/roles`, AuthEndpoints.getAllRoles(db));
        app.post(`${prefix}/createRole`, AuthActions.checkAuthenticated, AuthEndpoints.createRole(db));
        app.post(`${prefix}/addPermissionToRole`, AuthActions.checkAuthenticated, AuthEndpoints.addPermissionToRole(db));
        app.get(`${prefix}/getUserPermissions`, AuthActions.checkAuthenticated, AuthEndpoints.getUserPermissions(db));
        app.get(`${prefix}/getUserRoles`, AuthActions.checkAuthenticated, AuthEndpoints.getUserRoles(db));
        app.post(`${prefix}/addRoleToUser`, AuthActions.checkAuthenticated, AuthEndpoints.addRoleToUser(db));
        app.delete(`${prefix}/removeRoleFromUser`, AuthActions.checkAuthenticated, AuthEndpoints.removeRoleFromUser(db));

        return app;
    }
}