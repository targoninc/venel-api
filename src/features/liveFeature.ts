import {MariaDbDatabase} from "./database/mariaDbDatabase";
import {ServerOptions, WebSocketServer} from "ws";
import {MessagingEndpoints} from "./messaging/endpoints";
import {CLI} from "../tooling/CLI";
import {User} from "./database/models";
import {Application} from "express";
import {createServer} from "http";

export class LiveFeature {
    static enable(app: Application, userMap: Map<string, User>, db: MariaDbDatabase) {
        const server = createServer(app);
        const wss = new WebSocketServer({
            noServer: true
        } as ServerOptions);

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

        server.on("upgrade", (req, socket, head) => {
            socket.on('error', CLI.error);

            let connectSid = req.headers.cookie?.split(';').find((c: string) => c.trim().startsWith('connect.sid='));
            if (!connectSid) {
                socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
                socket.destroy();
                return;
            }

            connectSid = connectSid.split('=')[1];
            if (userMap.has(connectSid)) {
                const user = userMap.get(connectSid);
                wss.handleUpgrade(req, socket, head, function done(ws) {
                    wss.emit('connection', ws, { user });
                });
            } else {
                CLI.debug("Unauthorized user tried to connect to live feature: " + connectSid);
                socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
                socket.destroy();
                return;
            }
        });

        server.listen(8912, '0.0.0.0', () => {
            CLI.success("Live feature enabled @ ws://localhost:8912");
        });
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