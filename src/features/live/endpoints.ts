import { Request, Response } from "express";

export class LiveEndpoints {
    static getWebsocketEndpoint() {
        return (req: Request, res: Response, next: Function) => {
            const url = process.env.WEBSOCKET_URL ?? "ws://127.0.0.1:8912";
            res.send(url);
        }
    }
}