import {Application} from "express";
import {AuthActions} from "./authentication/actions";
import {MariaDbDatabase} from "./database/mariaDbDatabase";
import {MessagingEndpoints} from "./messaging/endpoints";

export class MessagingFeature {
    static enable(app: Application, db: MariaDbDatabase) {
        // Messages
        const mPrefix = "/api/messaging";
        app.post(`${mPrefix}/sendMessage`, AuthActions.checkAuthenticated, MessagingEndpoints.sendMessage(db));
        app.delete(`${mPrefix}/deleteMessage`, AuthActions.checkAuthenticated, MessagingEndpoints.deleteMessage(db));
        app.patch(`${mPrefix}/editMessage`, AuthActions.checkAuthenticated, MessagingEndpoints.editMessage(db));

        // Channels
        const cPrefix = "/api/channels";
        app.post(`${cPrefix}/createDirect`, AuthActions.checkAuthenticated, MessagingEndpoints.createChannelDm(db));
        app.get(`${cPrefix}/getMessages`, AuthActions.checkAuthenticated, MessagingEndpoints.getMessages(db));
        app.get(`${cPrefix}/getChannels`, AuthActions.checkAuthenticated, MessagingEndpoints.getChannels(db));

        return app;
    }
}