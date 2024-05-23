import {MariaDbDatabase} from "../database/mariaDbDatabase";
import {Request, Response} from "express";
import {User} from "../database/models";

export class MessagingEndpoints {
    static sendMessage(db: MariaDbDatabase) {
        return async (req: Request, res: Response) => {
            const user = req.user as User;

            const channelId = req.body.channelId;
            if (!channelId) {
                res.status(400).send("Channel ID is required");
                return;
            }

            const text = req.body.text;
            if (!text) {
                res.status(400).send("Text is required");
                return;
            }

            const channel = await db.getChannelById(channelId);
            if (!channel) {
                res.status(404).send("Channel not found");
                return;
            }

            await db.createMessage(channelId, user.id, text);
        }
    }

    static createChannelDm(db: MariaDbDatabase) {
        return async (req: Request, res: Response) => {
            const user = req.user as User;

            const targetUserId = req.body.targetUserId;
            if (!targetUserId) {
                res.status(400).send("Target User ID is required");
                return;
            }

            const targetUser = await db.getUserById(targetUserId);
            if (!targetUser) {
                res.status(404).send("Target User not found");
                return;
            }

            const channelId = await db.createChannelDm(user.id, targetUserId);
            res.json({channelId});
        }
    }
}