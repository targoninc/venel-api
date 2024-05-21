export namespace Venel {
    export type Id = number;

    export interface BridgeInstance {
        id: Id;
        url: string;
    }

    export interface Channel {
        id: Id;
        bridged: boolean;
        bridgeInstanceId?: Id;
        bridgedChannelId?: Id;
        name?: string;
    }

    export interface Reaction {
        id: Id;
        content?: string;
    }

    export interface User {
        id: Id;
        username: string;
        phoneNumber?: string;
        passwordHash: string;
        displayname?: string;
        description?: string;
        createdAt: Date;
        updatedAt: Date;
        registrationIp?: string;
        lastLoginIp?: string;
    }

    export interface ChannelMember {
        channelId: Id;
        userId: Id;
    }

    export interface Message {
        id: Id;
        channelId: Id;
        parentMessageId?: Id;
        senderId?: Id;
        text?: string;
        createdAt: Date;
        updatedAt: Date;
    }

    export interface AudioAttachment {
        id: Id;
        messageId?: Id;
        binaryContent?: any;
    }

    export interface ImageAttachment {
        id: Id;
        messageId?: Id;
        binaryContent?: any;
    }

    export interface MessageReaction {
        messageId: Id;
        reactionId: Id;
    }

    export interface Permission {
        id: Id;
        name: string;
        description: string;
    }

    export interface Role {
        id: Id;
        name: string;
        description: string;
    }

    export interface RolePermission {
        roleId: Id;
        permissionId: Id;
    }

    export interface UserRole {
        userId: Id;
        roleId: Id;
    }
}