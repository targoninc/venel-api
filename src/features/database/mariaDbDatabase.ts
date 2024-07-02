import mariadb from 'mariadb';
import {CLI} from "../../tooling/CLI";
import {
    Attachment,
    BridgeInstance,
    Channel,
    ChannelMember,
    Id,
    Message,
    Permission,
    Reaction,
    ReactionGroup,
    Role,
    User, UserSetting
} from "./models";
import {SafeUser} from "../../models/safeUser";

export class MariaDbDatabase {
    private readonly host: string;
    private readonly port: number;
    private readonly user: string;
    private readonly password: string;
    private readonly database: string;
    private pool: mariadb.Pool | null = null;

    constructor(host: string | null = null, user: string | null = null, password: string | null = null, port: number | null = null) {
        this.host = host || process.env.MYSQL_HOST || 'localhost';
        this.port = port || 3306;
        this.user = user || process.env.MYSQL_USER || 'root';
        this.password = password || process.env.MYSQL_PASSWORD || '';
        this.database = 'venel';
        CLI.info(`Set up MariaDB connection to ${this.host}:${this.port} with user ${this.user} and database venel.`);
    }

    connect() {
        this.pool = mariadb.createPool({
            host: this.host,
            port: this.port,
            user: this.user,
            password: this.password,
            database: this.database
        });
        if (!this.pool) {
            throw new Error("Could not connect to database.");
        }
    }

    async query(sql: string, params: unknown[] = []) {
        if (!this.pool) {
            this.connect();
        }
        let conn;
        try {
            conn = await this.pool!.getConnection();
            return await conn.query({
                sql,
                bigIntAsNumber: true
            }, params);
        } catch (e: any) {
            if (e.message.includes("Unknown column")) {
                await this.handleUnknownColumnError(sql, e);
            }
            throw e;
        } finally {
            if (conn) {
                await conn.end();
            }
        }
    }

    async handleUnknownColumnError(sql: string, e: any) {
        const matches = e.message.match(/Unknown column '(.+?)'/);
        if (!matches) {
            throw e;
        }
        const column = matches[1];
        if (!column) {
            throw e;
        }
        CLI.error(`Unknown column: ${column}`);
        const table = column.split('.')[0];

    }

    async getUsers(): Promise<User[] | undefined> {
        return await this.query("SELECT * FROM venel.users");
    }

    async getUserByUsername(username: string): Promise<User | null> {
        const rows = await this.query("SELECT * FROM venel.users WHERE username = ?", [username]);

        return rows ? rows[0] : null;
    }

    async getUserById(id: Id): Promise<User | null> {
        const rows = await this.query("SELECT * FROM venel.users WHERE id = ?", [id]);
        return rows ? rows[0] : null;
    }

    async createUser(username: string, hashedPassword: string, ip: string): Promise<void> {
        await this.query("INSERT INTO venel.users (username, passwordHash, registrationIp) VALUES (?, ?, ?)", [username, hashedPassword, ip]);
    }

    async updateUserIp(id: Id, ip: string): Promise<void> {
        await this.query("UPDATE venel.users SET lastLoginIp = ? WHERE id = ?", [ip, id]);
    }

    async updateUserUsername(id: Id, username: string): Promise<void> {
        await this.query("UPDATE venel.users SET username = ? WHERE id = ?", [username, id]);
    }

    async updateUserDisplayname(id: Id, displayname: string): Promise<void> {
        await this.query("UPDATE venel.users SET displayname = ? WHERE id = ?", [displayname, id]);
    }

    async updateUserDescription(id: Id, description: string): Promise<void> {
        await this.query("UPDATE venel.users SET description = ? WHERE id = ?", [description, id]);
    }

    async createRole(name: string, description = "") {
        await this.query("INSERT INTO venel.roles (name, description) VALUES (?, ?) ON DUPLICATE KEY UPDATE name = name", [name, description]);
    }

    async createPermission(name: string, description: string) {
        await this.query("INSERT INTO venel.permissions (name, description) VALUES (?, ?) ON DUPLICATE KEY UPDATE name = name", [name, description]);
    }

    async createRolePermission(roleId: Id, permissionId: Id) {
        await this.query("INSERT INTO venel.rolePermissions (roleId, permissionId) VALUES (?, ?) ON DUPLICATE KEY UPDATE roleId = roleId", [roleId, permissionId]);
    }

    async createUserRole(userId: Id, roleId: Id) {
        await this.query("INSERT INTO venel.userRoles (userId, roleId) VALUES (?, ?) ON DUPLICATE KEY UPDATE userId = userId", [userId, roleId]);
    }

    async getRoleByName(name: string): Promise<Role | null> {
        const rows = await this.query("SELECT * FROM venel.roles WHERE name = ?", [name]);
        return rows ? rows[0] : null;
    }

    async deleteUserRole(userId: Id, roleId: Id) {
        await this.query("DELETE FROM venel.userRoles WHERE userId = ? AND roleId = ?", [userId, roleId]);
    }

    async getPermissions(): Promise<Permission[] | undefined> {
        return await this.query("SELECT * FROM venel.permissions");
    }

    async getRoles(): Promise<Role[] | undefined> {
        return await this.query("SELECT * FROM venel.roles");
    }

    async getUserRoles(userId: Id): Promise<Role[] | undefined> {
        return await this.query("SELECT r.id, r.name, r.description FROM venel.roles r INNER JOIN venel.userRoles ur ON r.id = ur.roleId WHERE ur.userId = ?", [userId]);
    }

    async getRolePermissions(roleId: Id): Promise<Permission[] | undefined> {
        return await this.query(`SELECT * FROM venel.permissions INNER JOIN venel.rolePermissions ON 
permissions.id = rolePermissions.permissionId WHERE rolePermissions.roleId = ?`, [roleId]);
    }

    async getUserPermissions(userId: Id): Promise<Permission[] | undefined> {
        return await this.query(`SELECT p.id, p.name, p.description FROM venel.permissions p INNER JOIN venel.rolePermissions rp ON 
p.id = rp.permissionId INNER JOIN venel.userRoles ur ON rp.roleId = ur.roleId 
WHERE ur.userId = ?`, [userId]);
    }

    async createMessage(channelId: Id, senderId: Id, text: string) {
        await this.query("INSERT INTO venel.messages (channelId, senderId, text) VALUES (?, ?, ?)", [channelId, senderId, text]);
    }

    async getChannelById(channelId: Id): Promise<Channel | null> {
        const rows = await this.query("SELECT * FROM venel.channels WHERE id = ?", [channelId]);
        return rows ? rows[0] : null;
    }

    async getMessagesForChannel(channelId: Id, offset: number): Promise<Message[] | null> {
        return await this.query("SELECT * FROM venel.messages m WHERE channelId = ? ORDER BY createdAt DESC LIMIT 100 OFFSET ?", [channelId, offset]);
    }

    async getAttachmentsForMessage(messageId: Id): Promise<Attachment[]> {
        return await this.query("SELECT * FROM venel.attachments WHERE messageId = ?", [messageId]) ?? [];
    }

    async deleteUser(id: Id) {
        await this.query("DELETE FROM venel.users WHERE id = ?", [id]);
    }

    async createChannelDm(id: Id, targetUserId: Id) {
        const timestamp = new Date().toISOString();
        await this.query("INSERT INTO venel.channels (type, name) VALUES ('dm', ?)", [timestamp + " (DM)"]);
        const rows = await this.query("SELECT id FROM venel.channels WHERE name = ?", [timestamp + " (DM)"]);
        const channelId = rows ? rows[0].id : null;
        if (!channelId) {
            throw new Error("Could not create channel");
        }

        if (id !== targetUserId) {
            await this.query("INSERT INTO venel.channelMembers (channelId, userId) VALUES (?, ?), (?, ?)", [
                channelId, id,
                channelId, targetUserId
            ]);
        } else {
            await this.query("INSERT INTO venel.channelMembers (channelId, userId) VALUES (?, ?)", [channelId, id]);
        }
        return channelId;
    }

    async getChannelMembers(channelId: Id): Promise<ChannelMember[] | null> {
        return await this.query("SELECT * FROM venel.channelMembers WHERE channelId = ?", [channelId]);
    }

    async getChannelMembersAsUsers(channelId: Id): Promise<User[] | null> {
        return await this.query("SELECT u.id, u.updatedAt, u.createdAt, u.username, u.displayname, u.description, u.avatar FROM venel.users u INNER JOIN venel.channelMembers cm ON u.id = cm.userId WHERE cm.channelId = ?", [channelId]);
    }

    async getMessageById(messageId: Id): Promise<Message | null> {
        const rows = await this.query("SELECT * FROM venel.messages WHERE id = ?", [messageId]);
        return rows ? rows[0] : null;
    }

    async deleteMessage(messageId: Id) {
        await this.query("DELETE FROM venel.messages WHERE id = ?", [messageId]);
    }

    async editMessage(messageId: Id, text: string) {
        await this.query("UPDATE venel.messages SET text = ? WHERE id = ?", [text, messageId]);
    }

    async getChannelsForUser(id: Id): Promise<Channel[] | null> {
        return await this.query("SELECT c.id, c.type, c.name, c.createdAt, c.updatedAt FROM venel.channels c INNER JOIN venel.channelMembers cm ON c.id = cm.channelId WHERE cm.userId = ?", [id]);
    }

    async getLastMessageForChannel(channelId: Id): Promise<Message | null> {
        const rows = await this.query("SELECT * FROM venel.messages WHERE channelId = ? ORDER BY createdAt DESC LIMIT 1", [channelId]);
        return rows ? rows[0] : null;
    }

    async searchUsers(query: string): Promise<User[] | null> {
        return await this.query("SELECT * FROM venel.users WHERE username LIKE ? OR displayname LIKE ?", [`%${query}%`, `%${query}%`]);
    }

    async updateUserAvatar(id: Id, avatar: string | null) {
        await this.query("UPDATE venel.users SET avatar = ? WHERE id = ?", [avatar, id]);
    }

    async getBridgedInstances(): Promise<BridgeInstance[] | null> {
        return await this.query("SELECT * FROM venel.bridgeInstances");
    }

    async addBridgedInstance(url: string, useAllowlist: boolean, enabled: boolean) {
        await this.query("INSERT INTO venel.bridgeInstances (url, useAllowlist, enabled) VALUES (?, ?, ?)", [url, useAllowlist, enabled]);
    }

    async removeBridgedInstance(id: Id) {
        await this.query("DELETE FROM venel.bridgeInstances WHERE id = ?", [id]);
    }

    async getBridgedInstanceByUrl(url: string): Promise<BridgeInstance | null> {
        const rows = await this.query("SELECT * FROM venel.bridgeInstances WHERE url = ?", [url]);
        return rows ? rows[0] : null;
    }

    async toggleBridgedInstanceAllowlist(id: Id) {
        await this.query("UPDATE venel.bridgeInstances SET useAllowlist = !useAllowlist WHERE id = ?", [id]);
    }

    async toggleBridgedInstanceEnabled(id: Id) {
        await this.query("UPDATE venel.bridgeInstances SET enabled = !enabled WHERE id = ?", [id]);
    }

    async getBridgesUsersForInstance(id: Id): Promise<SafeUser[]> {
        return await this.query("SELECT u.id, u.username, u.displayname, u.description, u.avatar FROM venel.users u INNER JOIN venel.bridgedUsers bia ON u.id = bia.userId WHERE bia.instanceId = ?", [id]);
    }

    async addBridgedUser(instanceId: Id, userId: Id) {
        await this.query("INSERT INTO venel.bridgedUsers (instanceId, userId) VALUES (?, ?)", [instanceId, userId]);
    }

    async removeBridgedUser(instanceId: Id, userId: Id) {
        await this.query("DELETE FROM venel.bridgedUsers WHERE instanceId = ? AND userId = ?", [instanceId, userId]);
    }

    async getBridgedInstanceById(instanceId: Id) {
        const rows = await this.query("SELECT * FROM venel.bridgeInstances WHERE id = ?", [instanceId]);
        return rows ? rows[0] : null;
    }

    async updateUserPassword(id: Id, hash: string) {
        await this.query("UPDATE venel.users SET passwordHash = ? WHERE id = ?", [hash, id]);
    }

    async isOnlyAdmin(id: Id) {
        const rows = await this.query("SELECT * FROM venel.userRoles WHERE userId = ? AND roleId = (SELECT id FROM venel.roles WHERE name = 'admin')", [id]);
        return rows.length === 1;
    }

    async getAvailableReactions(): Promise<Reaction[] | null> {
        return await this.query("SELECT * FROM venel.reactions");
    }

    async getReactionsForMessage(id: Id): Promise<Reaction[]> {
        return await this.query("SELECT r.id, mr.userId FROM venel.reactions r INNER JOIN venel.messageReactions mr ON r.id = mr.reactionId WHERE mr.messageId = ?", [id]);
    }

    async createReaction(content: string, groupId: Id, identifier: string) {
        await this.query("INSERT INTO venel.reactions (content, groupId, identifier) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE content = content", [content, groupId, identifier]);
    }

    async createReactionGroup(id: Id, display: string) {
        await this.query("INSERT INTO venel.reactionGroups (id, display) VALUES (?, ?) ON DUPLICATE KEY UPDATE id = id", [id, display]);
    }

    async getReactionGroups(): Promise<ReactionGroup[] | null> {
        return await this.query("SELECT * FROM venel.reactionGroups");
    }

    async addReaction(userId: Id, messageId: Id, reactionId: Id) {
        await this.query("INSERT INTO venel.messageReactions (userId, messageId, reactionId) VALUES (?, ?, ?)", [userId, messageId, reactionId]);
    }

    async removeReaction(userId: Id, messageId: Id, reactionId: Id) {
        await this.query("DELETE FROM venel.messageReactions WHERE userId = ? AND messageId = ? AND reactionId = ?", [userId, messageId, reactionId]);
    }

    async updateUserSetting(id: Id, setting: string, value: string) {
        await this.query("INSERT INTO venel.userSettings (userId, settingKey, value) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE value = ?", [id, setting, value, value]);
    }

    async getUserSettings(id: Id): Promise<UserSetting[] | null> {
        return await this.query("SELECT * FROM venel.userSettings WHERE userId = ?", [id]);
    }

    async createAttachment(id: Id, type: string, filename: string, size: string) {
        await this.query("INSERT INTO venel.attachments (messageId, type, filename, size) VALUES (?, ?, ?, ?)", [id, type, filename, size]);
    }

    async getMessageAttachment(messageId: Id, name: string): Promise<Attachment | null> {
        const rows = await this.query("SELECT * FROM venel.attachments WHERE messageId = ? AND filename = ?", [messageId, name]);
        return rows[0] ?? null;
    }

    async getChannelByMessageId(messageId: Id) {
        const rows = await this.query("SELECT * FROM venel.channels WHERE id IN (SELECT channelId FROM venel.messages WHERE id = ?)", [messageId]);
        return rows[0] ?? null;
    }
}