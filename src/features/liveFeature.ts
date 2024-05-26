import {MariaDbDatabase} from "./database/mariaDbDatabase";
import WebSocket from "ws";
import {MessagingEndpoints} from "./messaging/endpoints";
import {CLI} from "../tooling/CLI";
import {User} from "./database/models";
import {Application} from "express";
import { createServer } from "http";

export class LiveFeature {
    static async enable(db: MariaDbDatabase, app: Application) {
        const server = createServer(app);
        const wss = new WebSocket.Server({
            noServer: true
        });

        wss.on("connection", (ws: any) => {
            ws.user = null;

            ws.on("close", () => {
                if (ws.user) {
                    CLI.info(`User ${ws.user.id} disconnected.`);
                }
            });

            ws.on("error", (error: any) => {
                if (ws.user) {
                    CLI.error(`User ${ws.user.id} errored: ${error}`);
                }
            });

            ws.on("message", async (message: any) => {
                const data = JSON.parse(message.toString());
                switch (data.type) {
                    case "message":
                        await LiveFeature.sendMessage(data, ws.user, (response: any) => {
                            ws.send(JSON.stringify(response));
                        }, (error: string) => {
                            ws.send(JSON.stringify({error}));
                        }, db);
                        break;
                }
            });
        });

        server.on("upgrade", (request, socket, head) => {
            socket.on('error', CLI.error);

            // This function is not defined on purpose. Implement it with your own logic.
            authenticate(request, function next(err, client) {
                if (err || !client) {
                    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
                    socket.destroy();
                    return;
                }

                socket.removeListener('error', onSocketError);

                wss.handleUpgrade(request, socket, head, function done(ws) {
                    wss.emit('connection', ws, request, client);
                });
            });
        });

        server.listen(8080);
    }

    static async sendMessage(data: any, user: User, send: Function, error: Function, db: MariaDbDatabase) {
        const channelId = data.channelId;
        if (!channelId) {
            error("Channel ID is required");
            return;
        }

        const text = data.text;
        if (!text) {
            error("Text is required");
            return;
        }

        const invalid = await MessagingEndpoints.checkChannelAccess(db, user, channelId);
        if (invalid !== null) {
            error(invalid.error);
            return;
        }
        await db.createMessage(channelId, user.id, text);
        CLI.success(`Message sent to channel ${channelId} by user ${user.id}.`);
        send({message: "Message sent"});
    }
}