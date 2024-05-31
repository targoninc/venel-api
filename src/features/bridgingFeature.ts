import {MariaDbDatabase} from "./database/mariaDbDatabase";
import {Application} from "express";
import {AuthActions} from "./authentication/actions";
import {BridgingEndpoints} from "./bridging/endpoints";

export class BridgingFeature {
    static enable(app: Application, db: MariaDbDatabase) {
        // Instances
        const bPrefix = "/api/bridging";
        app.get(`${bPrefix}/getInstances`, AuthActions.checkAuthenticated, BridgingEndpoints.getInstances(db));
        app.post(`${bPrefix}/addInstance`, AuthActions.checkAuthenticated, BridgingEndpoints.addInstance(db));
        app.delete(`${bPrefix}/removeInstance`, AuthActions.checkAuthenticated, BridgingEndpoints.removeInstance(db));
        app.patch(`${bPrefix}/toggleAllowlist`, AuthActions.checkAuthenticated, BridgingEndpoints.toggleAllowlist(db));
        app.patch(`${bPrefix}/toggleEnabled`, AuthActions.checkAuthenticated, BridgingEndpoints.toggleEnabled(db));
    }
}