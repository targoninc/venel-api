import {MariaDbDatabase} from "../database/mariaDbDatabase";
import {Request, Response} from "express";
import {ChannelMember, User} from "../database/models";
import {CLI} from "../../tooling/CLI";
import {PermissionsList} from "../../enums/permissionsList";
import {safeUser} from "../authentication/actions";
import {ReceivableMessage} from "../../models/receivableMessage";
import {UiChannel} from "../../models/uiChannel";
import {ChannelProcessor} from "./channelProcessor";

export class MessagingEndpoints {
    static async checkChannelAccess(db: MariaDbDatabase, user: User, channelId: number) {
        const channel = await db.getChannelById(channelId);
        if (!channel) {
            return {
                error: "Channel not found",
                code: 404
            };
        }

        const members = await db.getChannelMembers(channelId);
        if (!members || !members.find((m: ChannelMember) => m.userId === user.id)) {
            return {
                error: "You are not a member of this channel",
                code: 403
            };
        }

        return null;
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

            const invalid = await MessagingEndpoints.checkChannelAccess(db, user, channelId);
            if (invalid !== null) {
                res.status(invalid.code).send(invalid.error);
                return;
            }
            await db.createMessage(channelId, user.id, text);
            const message = await db.getLastMessageForChannel(channelId) as ReceivableMessage | null;
            if (!message) {
                res.status(500).send("Message not found");
                return;
            }
            message.sender = safeUser(user);
            CLI.success(`Message sent to channel ${channelId} by user ${user.id}.`);
            res.json(message);
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

            const invalid = await MessagingEndpoints.checkChannelAccess(db, user, message.channelId);
            if (invalid !== null) {
                res.status(invalid.code).send(invalid.error);
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

            const invalid = await MessagingEndpoints.checkChannelAccess(db, user, message.channelId);
            if (invalid !== null) {
                res.status(invalid.code).send(invalid.error);
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

            const invalid = await MessagingEndpoints.checkChannelAccess(db, user, parseInt(channelId));
            if (invalid !== null) {
                res.status(invalid.code).send(invalid.error);
                return;
            }
            const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
            const messages = await db.getMessagesForChannel(parseInt(channelId), offset);
            if (!messages) {
                res.json([]);
                return;
            }

            const users: Map<number, User> = new Map();
            for (const message of messages as ReceivableMessage[]) {
                if (!message.senderId) {
                    continue;
                }

                if (!users.has(message.senderId)) {
                    const user = await db.getUserById(message.senderId);
                    if (user) {
                        users.set(message.senderId, user);
                    }
                }

                const sender = users.get(message.senderId);
                message.sender = safeUser(sender as User);
            }
            res.json(messages);
        }
    }

    static getChannels(db: MariaDbDatabase) {
        return async (req: Request, res: Response) => {
            const user = req.user as User;

            const channels = await db.getChannelsForUser(user.id);
            if (!channels) {
                res.json([]);
                return;
            }
            let out = [] as UiChannel[];
            for (let channel of channels as UiChannel[]) {
                out.push(await ChannelProcessor.processChannel(channel, user, db));
            }
            res.json(out);
        }
    }

    static searchUsers(db: MariaDbDatabase) {
        return async (req: Request, res: Response) => {
            const query = req.query.query as string;
            if (!query) {
                res.status(400).send("Query is required");
                return;
            }

            const users = await db.searchUsers(query);
            if (!users) {
                res.json([]);
                return;
            }
            res.json(users.map(u => safeUser(u)));
        }

    }
}

