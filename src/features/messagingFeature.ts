import {Application} from "express";
import {AuthActions} from "./authentication/actions";
import {MariaDbDatabase} from "./database/mariaDbDatabase";
import {MessagingEndpoints} from "./messaging/endpoints";
import fs from "fs";
import {CLI} from "../tooling/CLI";

export class MessagingFeature {
    static enable(app: Application, db: MariaDbDatabase) {
        if (!process.env.FILE_FOLDER) {
            throw new Error("FILE_FOLDER is not set");
        }

        // Messages
        const mPrefix = "/api/messaging";
        app.post(`${mPrefix}/sendMessage`, AuthActions.checkAuthenticated, MessagingEndpoints.sendMessage(db));
        app.delete(`${mPrefix}/deleteMessage`, AuthActions.checkAuthenticated, MessagingEndpoints.deleteMessage(db));
        app.patch(`${mPrefix}/editMessage`, AuthActions.checkAuthenticated, MessagingEndpoints.editMessage(db));

        // Reactions
        const rPrefix = "/api/reactions";
        app.get(`${rPrefix}/getAvailableReactions`, MessagingEndpoints.getAvailableReactions(db));
        app.get(`${rPrefix}/getReactionGroups`, MessagingEndpoints.getReactionGroups(db));

        // Users
        const uPrefix = "/api/users";
        app.get(`${uPrefix}/search`, AuthActions.checkAuthenticated, MessagingEndpoints.searchUsers(db));

        // Channels
        const cPrefix = "/api/channels";
        app.post(`${cPrefix}/createDirect`, AuthActions.checkAuthenticated, MessagingEndpoints.createChannelDm(db));
        app.get(`${cPrefix}/getMessages`, AuthActions.checkAuthenticated, MessagingEndpoints.getMessages(db));
        app.get(`${cPrefix}/getChannels`, AuthActions.checkAuthenticated, MessagingEndpoints.getChannels(db));

        // Attachments
        const aPrefix = "/attachments";
        app.get(`${aPrefix}/:messageId/:filename`, AuthActions.checkAuthenticated, async (req, res, next) => {
            const messageId = req.params.messageId;
            if (!messageId) {
                res.status(400).send("Message ID is required");
                return;
            }
            const filename = req.params.filename;
            if (!filename) {
                res.status(400).send("Filename is required");
                return;
            }

            const messageFolder = process.env.FILE_FOLDER + "/" + messageId;
            if (!fs.existsSync(messageFolder)) {
                res.status(404).send("Message not found");
                return;
            }
            const attachmentPath = process.env.FILE_FOLDER + "/" + messageId + "/" + req.params.filename;
            if (!fs.existsSync(attachmentPath)) {
                res.status(404).send("Attachment not found");
                return;
            }
            CLI.debug(`Sending attachment ${attachmentPath}`);
            const stat = fs.statSync(attachmentPath);
            const messageAttachment = await db.getMessageAttachment(parseInt(messageId.toString()), filename.toString());
            res.setHeader("Content-Type", messageAttachment?.type ?? "application/octet-stream");
            res.setHeader("Content-Length", stat.size);
            const base64 = fs.readFileSync(attachmentPath).toString("base64");
            res.send(base64);
        });

        return app;
    }
}