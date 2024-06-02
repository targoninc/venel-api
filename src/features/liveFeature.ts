import {MariaDbDatabase} from "./database/mariaDbDatabase";
import {ServerOptions, WebSocketServer} from "ws";
import {MessagingEndpoints} from "./messaging/endpoints";
import {CLI} from "../tooling/CLI";
import {User} from "./database/models";
import {Application} from "express";
import {createServer} from "http";
import {UserWebSocket} from "./live/UserWebSocket";
import {avatarUser, safeUser} from "./authentication/actions";
import {PermissionsList} from "../enums/permissionsList";
import {LiveEndpoints} from "./live/endpoints";
import {ReceivableMessage} from "../models/receivableMessage";
import Jimp from "jimp";

export class LiveFeature {
    static enable(app: Application, userMap: Map<string, User>, db: MariaDbDatabase) {
        app.get("/api/live/url", LiveEndpoints.getWebsocketEndpoint());

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
                if (data.type !== "ping") {
                    CLI.debug("Received message: " + JSON.stringify(data, null, 2));
                }
                switch (data.type) {
                    case "message":
                        await LiveFeature.sendMessage(data, ws.user, clients, ws, db);
                        break;
                    case "updateAvatar":
                        await LiveFeature.updateAvatar(userMap, data, ws.user, clients, ws, db);
                        break;
                    case "removeMessage":
                        await LiveFeature.removeMessage(data, ws.user, clients, ws, db);
                        break;
                    case "status":
                        await LiveFeature.propagateStatus(data, ws.user, clients, ws);
                        break;
                    case "createChannelDm":
                        await LiveFeature.createChannelDm(data, ws.user, clients, ws, db);
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
                wss.handleUpgrade(req, socket, head, function done(ws: any) {
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

        await db.createMessage(channelId, user.id, text);
        const message = await db.getLastMessageForChannel(channelId) as ReceivableMessage | null;
        if (!message) {
            client.send(JSON.stringify({error: "Message not found"}));
            return;
        }
        const sender = await db.getUserById(user.id);
        if (!sender) {
            client.send(JSON.stringify({error: "Sender not found"}));
            return;
        }
        message.sender = safeUser(sender);

        const payload = JSON.stringify({
            type: "message",
            message
        });
        CLI.debug(`Propagating message from ${user.id} to ${clients.size} clients.`);
        for (const ws of clients) {
            if (ws.readyState !== ws.OPEN) {
                continue;
            }

            const invalid = await MessagingEndpoints.checkChannelAccess(db, ws.user, channelId);
            if (invalid !== null) {
                continue;
            }
            ws.send(payload);
        }
    }

    private static async updateAvatar(userMap: Map<string, User>, data: any, user: User, clients: Set<UserWebSocket>, client: UserWebSocket, db: MariaDbDatabase) {
        let avatar = data.avatar;

        if (avatar) {
            const rawData = avatar.replace(/^data:image\/\w+;base64,/, '');
            const image = await Jimp.read(Buffer.from(rawData, 'base64'));
            image.quality(60).resize(256, 256);
            avatar = await image.getBase64Async(Jimp.MIME_JPEG);
            await db.updateUserAvatar(user.id, avatar);
        } else {
            await db.updateUserAvatar(user.id, null);
        }

        const outUser = await db.getUserById(user.id);
        if (!outUser) {
            client.send(JSON.stringify({error: "User not found"}));
            return;
        }
        client.user = outUser;
        const userMapKey = Array.from(userMap.keys()).find(k => userMap.get(k)?.id === user.id);
        if (userMapKey) {
            userMap.set(userMapKey, outUser);
        }

        const payload = JSON.stringify({
            type: "updateAvatar",
            userId: user.id,
            avatar
        });
        CLI.debug(`Propagating avatar update from ${user.id} to ${clients.size} clients.`);
        for (const ws of clients) {
            if (ws.readyState !== ws.OPEN) {
                continue;
            }

            if (ws.user.id === user.id) {
                continue;
            }

            ws.send(payload);
        }
    }

    private static async removeMessage(data: any, user: User, clients: Set<UserWebSocket>, client: UserWebSocket, db: MariaDbDatabase) {
        const messageId = data.messageId;
        if (!messageId) {
            client.send(JSON.stringify({error: "Message ID is required"}));
            return;
        }

        const message = await db.getMessageById(messageId);
        if (!message) {
            client.send(JSON.stringify({error: "Message not found"}));
            return;
        }

        if (message.senderId !== user.id) {
            const selfPermissions = await db.getUserPermissions(user.id);
            if (!selfPermissions || !selfPermissions.some(p => p.name === PermissionsList.deleteMessage.name)) {
                client.send(JSON.stringify({error: "You do not have permission to delete this message"}));
                return;
            }
        }

        const invalid = await MessagingEndpoints.checkChannelAccess(db, user, message.channelId);
        if (invalid !== null) {
            client.send(JSON.stringify({error: invalid}));
            return;
        }

        await db.deleteMessage(messageId);

        const payload = JSON.stringify({
            type: "removeMessage",
            channelId: message.channelId,
            messageId
        });
        CLI.debug(`Propagating message removal from ${user.id} to ${clients.size} clients.`);
        for (const ws of clients) {
            if (ws.readyState !== ws.OPEN) {
                continue;
            }

            if (ws.user.id === user.id) {
                continue;
            }

            const invalid = await MessagingEndpoints.checkChannelAccess(db, ws.user, message.channelId);
            if (invalid !== null) {
                continue;
            }
            ws.send(payload);
        }
    }

    private static async propagateStatus(data: any, user: User, clients: Set<UserWebSocket>, ws: UserWebSocket) {
        const payload = JSON.stringify({
            type: "status",
            status: data.status,
            userId: user.id
        });

        CLI.debug(`Propagating status from ${user.id} to ${clients.size} clients.`);
        for (const ws of clients) {
            if (ws.readyState !== ws.OPEN) {
                continue;
            }

            if (ws.user.id === user.id) {
                continue;
            }

            ws.send(payload);
        }
    }

    private static async createChannelDm(data: any, user: User, clients: Set<UserWebSocket>, client: UserWebSocket, db: MariaDbDatabase) {
        const targetUserId = data.targetUserId;
        if (!targetUserId) {
            client.send(JSON.stringify({error: "Target User ID is required"}));
            return;
        }

        const targetUser = await db.getUserById(targetUserId);
        if (!targetUser) {
            client.send(JSON.stringify({error: "Target User not found"}));
            return;
        }

        const channelId = await db.createChannelDm(user.id, targetUserId);
        const channel = await db.getChannelById(channelId);
        if (!channel) {
            client.send(JSON.stringify({error: "Could not create channel"}));
            return;
        }
        CLI.success(`Created DM channel with ID ${channelId}.`);

        const payload = JSON.stringify({
            type: "newChannel",
            channel
        });
        for (const ws of clients) {
            if (ws.readyState !== ws.OPEN) {
                continue;
            }

            if (ws.user.id === user.id || ws.user.id === targetUserId) {
                CLI.debug(`Sending new channel to ${ws.user.id}`);
                ws.send(payload);
            }
        }
    }
}