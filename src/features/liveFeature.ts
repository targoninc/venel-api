import {MariaDbDatabase} from "./database/mariaDbDatabase";
import {ServerOptions, WebSocketServer} from "ws";
import {MessagingEndpoints} from "./messaging/endpoints";
import {CLI} from "../tooling/CLI";
import {Message, User} from "./database/models";
import {Application} from "express";
import {createServer} from "http";
import {UserWebSocket} from "./live/UserWebSocket";
import {safeUser, SafeUser} from "./authentication/actions";

export class LiveFeature {
    static enable(app: Application, userMap: Map<string, User>, db: MariaDbDatabase) {
        const server = createServer(app);
        const wss = new WebSocketServer({
            noServer: true
        } as ServerOptions);

        const clients = new Set<UserWebSocket>();
        wss.on("connection", (ws: any, info: { user: User }) => {
            ws.user = info.user;
            clients.add(ws);

            ws.on("close", () => {
                if (ws.user) {
                    CLI.info(`User ${ws.user.id} disconnected.`);
                } else {
                    CLI.info(`Unknown user disconnected.`);
                }
                clients.delete(ws);
            });

            ws.on("error", (error: any) => {
                if (ws.user) {
                    CLI.error(`User ${ws.user.id} errored: ${error}`);
                } else {
                    CLI.error(`Unknown user errored: ${error}`);
                }
            });

            ws.on("message", async (message: any) => {
                const data = JSON.parse(message.toString());
                switch (data.type) {
                    case "message":
                        await LiveFeature.sendMessage(data, ws.user, clients, ws, db);
                        break;
                }
            });
        });

        server.on("upgrade", (req, socket, head) => {
            socket.on('error', CLI.error);

            let connectSid = req.url?.split('?')[1]?.split('&').find((c: string) => c.startsWith('cid='));
            if (!connectSid) {
                CLI.debug("No connect.sid found in query string: " + req.url);
                socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
                socket.destroy();
                return;
            }

            connectSid = connectSid.split('=')[1];
            connectSid = decodeURIComponent(connectSid);
            if (userMap.has(connectSid)) {
                const user = userMap.get(connectSid);
                if (!user) {
                    CLI.debug("User not found in user map: " + connectSid);
                    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
                    socket.destroy();
                    return;
                }
                CLI.success(`User ${user.id} connected to websocket.`);
                wss.handleUpgrade(req, socket, head, function done(ws) {
                    wss.emit('connection', ws, { user });
                });
            } else {
                socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
                socket.destroy();
                return;
            }
        });

        server.listen(8912, '0.0.0.0', () => {
            CLI.success("Live feature enabled @ ws://localhost:8912");
        });
    }

    static async sendMessage(data: any, user: User, clients: Set<UserWebSocket>, client: UserWebSocket, db: MariaDbDatabase) {
        const channelId = data.channelId;
        if (!channelId) {
            client.send(JSON.stringify({error: "Channel ID is required"}));
            return;
        }

        const text = data.text;
        if (!text) {
            client.send(JSON.stringify({error: "Text is required"}));
            return;
        }

        const invalid = await MessagingEndpoints.checkChannelAccess(db, user, channelId);
        if (invalid !== null) {
            client.send(JSON.stringify({error: invalid}));
            return;
        }

        for (const ws of clients) {
            if (ws.readyState !== ws.OPEN) {
                continue;
            }

            if (ws.user.id === user.id) {
                continue;
            }

            const invalid = await MessagingEndpoints.checkChannelAccess(db, ws.user, channelId);
            if (invalid !== null) {
                continue;
            }
            CLI.debug(`Sending message to ${ws.user.id}`);
            ws.send(JSON.stringify({
                type: "message",
                message: <Message>{
                    text,
                    channelId,
                    sender: safeUser(user),
                    id: 0,
                    senderId: user.id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    parentMessageId: null,
                }
            }));
        }
    }
}