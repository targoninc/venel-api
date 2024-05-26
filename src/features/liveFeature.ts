import {MariaDbDatabase} from "./database/mariaDbDatabase";
import WebSocket from "ws";
import {MessagingEndpoints} from "./messaging/endpoints";
import {CLI} from "../tooling/CLI";
import {User} from "./database/models";
import express, {Application, Request} from "express";
import { createServer } from "http";
import {AuthActions} from "./authentication/actions";
import {MockResponse} from "../tooling/MockResponse";
import * as stream from "node:stream";

export class LiveFeature {
    static enable(app: Application, db: MariaDbDatabase) {
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

        server.on("upgrade", (req, socket, head) => {
            socket.on('error', CLI.error);

            AuthActions.checkAuthenticated(req as Request & { requestId?: string }, this.getMockResponse(socket), function next(err: any, client: any) {
                if (err || !client) {
                    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
                    socket.destroy();
                    return;
                }

                socket.removeListener('error', CLI.error);

                wss.handleUpgrade(req, socket, head, function done(ws) {
                    wss.emit('connection', ws, req, client);
                });
            });
        });

        server.listen(8080);
    }

    static getMockResponse(socket: stream.Duplex) {
        return new MockResponse((code: number) => {
            const strings: Record<number, string> = {
                401: 'Unauthorized',
                403: 'Forbidden',
                404: 'Not Found',
                500: 'Internal Server Error'
            };
            const text = strings[code] ?? 'Internal Server Error';
            socket.write(`HTTP/1.1 ${code} ${text}\r\r`);
            socket.destroy();
        }, (data: any) => {
            socket.write(`HTTP/1.1 200 OK\r\n\r\n${data}`);
            socket.destroy();
        }) as unknown as express.Response;
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