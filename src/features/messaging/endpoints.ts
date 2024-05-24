import {MariaDbDatabase} from "../database/mariaDbDatabase";
import {Request, Response} from "express";
import {ChannelMember, User} from "../database/models";
import {CLI} from "../../tooling/CLI";

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

            const members = await db.getChannelMembers(channelId);
            if (!members || !members.find((m: ChannelMember) => m.userId === user.id)) {
                res.status(403).send("You are not a member of this channel");
                return;
            }
            await db.createMessage(channelId, user.id, text);
            CLI.success(`Message sent to channel ${channelId} by user ${user.id}.`);
            res.json({message: "Message sent"});
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
            CLI.success(`Created DM channel with ID ${channelId}.`);
            res.json({channelId});
        }
    }
}