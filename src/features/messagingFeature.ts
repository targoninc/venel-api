import {Application} from "express";
import {AuthActions} from "./authentication/actions";
import {MariaDbDatabase} from "./database/mariaDbDatabase";
import {MessagingEndpoints} from "./messaging/endpoints";

export class MessagingFeature {
    static enable(app: Application, db: MariaDbDatabase) {
        // Messages
        const mPrefix = "/api/messaging";
        app.post(`${mPrefix}/sendMessage`, AuthActions.checkAuthenticated, MessagingEndpoints.sendMessage(db));

        // Channels
        const cPrefix = "/api/channels";
        app.post(`${cPrefix}/createDirect`, AuthActions.checkAuthenticated, MessagingEndpoints.createChannelDm(db));

        return app;
    }
}