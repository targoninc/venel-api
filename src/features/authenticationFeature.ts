import express, {Application} from "express";
import session from "express-session";
import passport, {SessionOptions} from "passport";
import {PassportDeserializeUser, PassportSerializeUser, PassportStrategy} from "./authentication/passport.js";
import {AuthEndpoints} from "./authentication/endpoints";
import {AuthActions} from "./authentication/actions";
import {MariaDbDatabase} from "./database/mariaDbDatabase.js";
import {User} from "./database/models";
import {CLI} from "../tooling/CLI";

export class AuthenticationFeature {
    static enable(__dirname: string, app: Application, db: MariaDbDatabase, userMap: Map<string, User>) {
        app.use(session({
            secret: process.env.SESSION_SECRET || "secret",
            rolling: true,
            resave: false,
            saveUninitialized: false
        }));

        app.use(passport.initialize());
        app.use(passport.session(<SessionOptions>{}));

        app.use((req, res, next) => {
            let connectSid = req.headers.cookie?.split(';').find((c: string) => c.trim().startsWith('connect.sid='));
            if (connectSid) {
                connectSid = connectSid.split('=')[1];
            }
            if (req.isAuthenticated() && connectSid) {
                const user = req.user as User;
                userMap.set(connectSid, user);
            } else if (connectSid) {
                userMap.delete(connectSid);
            }

            next();
        });

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
        app.get(`${prefix}/getConnectionSid`, AuthActions.checkAuthenticated, AuthEndpoints.getConnectionSid());

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