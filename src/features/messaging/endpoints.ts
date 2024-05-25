import {MariaDbDatabase} from "../database/mariaDbDatabase";
import {Request, Response} from "express";
import {ChannelMember, User} from "../database/models";
import {CLI} from "../../tooling/CLI";
import {PermissionsList} from "../../enums/permissionsList";

export class MessagingEndpoints {
    static async checkChannelAccess(db: MariaDbDatabase, user: User, channelId: number, res: Response) {
        const channel = await db.getChannelById(channelId);
        if (!channel) {
            res.status(404).send("Channel not found");
            return false;
        }

        const members = await db.getChannelMembers(channelId);
        if (!members || !members.find((m: ChannelMember) => m.userId === user.id)) {
            res.status(403).send("You are not a member of this channel");
            return false;
        }

        return true;
    }

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

            if (!await MessagingEndpoints.checkChannelAccess(db, user, channelId, res)) {
                return;
            }
            await db.createMessage(channelId, user.id, text);
            CLI.success(`Message sent to channel ${channelId} by user ${user.id}.`);
            res.json({message: "Message sent"});
        }
    }

    static deleteMessage(db: MariaDbDatabase) {
        return async (req: Request, res: Response) => {
            const user = req.user as User;

            const messageId = req.body.messageId;
            if (!messageId) {
                res.status(400).send("Message ID is required");
                return;
            }

            const message = await db.getMessageById(messageId);
            if (!message) {
                res.status(404).send("Message not found");
                return;
            }
            if (message.senderId !== user.id) {
                const selfPermissions = await db.getUserPermissions(user.id);
                if (!selfPermissions || !selfPermissions.find(p => p.name === PermissionsList.deleteMessage.name)) {
                    res.status(403).send("You do not have permission to delete this message");
                    return;
                }
            }

            if (!await MessagingEndpoints.checkChannelAccess(db, user, message.channelId, res)) {
                return;
            }
            await db.deleteMessage(messageId);
            CLI.success(`Message ${messageId} deleted by user ${user.id}.`);
            res.json({message: "Message deleted"});
        }
    }

    static editMessage(db: MariaDbDatabase) {
        return async (req: Request, res: Response) => {
            const user = req.user as User;

            const messageId = req.body.messageId;
            if (!messageId) {
                res.status(400).send("Message ID is required");
                return;
            }

            const text = req.body.text;
            if (!text) {
                res.status(400).send("Text is required");
                return;
            }

            const message = await db.getMessageById(messageId);
            if (!message) {
                res.status(404).send("Message not found");
                return;
            }

            if (message.senderId !== user.id) {
                res.status(403).send("You do not have permission to edit this message");
                return;
            }

            if (!await MessagingEndpoints.checkChannelAccess(db, user, message.channelId, res)) {
                return;
            }
            await db.editMessage(messageId, text);
            CLI.success(`Message ${messageId} edited by user ${user.id}.`);
            res.json({message: "Message edited"});
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

    static getMessages(db: MariaDbDatabase) {
        return async (req: Request, res: Response) => {
            const user = req.user as User;

            const channelId = req.query.channelId as string;
            if (!channelId) {
                res.status(400).send("Channel ID is required");
                return;
            }

            if (!await MessagingEndpoints.checkChannelAccess(db, user, parseInt(channelId), res)) {
                return;
            }
            const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
            const messages = await db.getMessagesForChannel(parseInt(channelId), offset);
            res.json(messages);
        }
    }

    static getChannels(db: MariaDbDatabase) {
        return async (req: Request, res: Response) => {
            const user = req.user as User;

            const channels = await db.getChannelsForUser(user.id);
            res.json(channels);
        }
    }
}