export namespace Venel {
    export type Id = number;

    export interface BridgeInstances {
        id: Id;
        url: string;
    }

    export interface Channels {
        id: Id;
        bridged: boolean;
        bridgeInstanceId?: Id;
        bridgedChannelId?: Id;
        name?: string;
    }

    export interface Reactions {
        id: Id;
        content?: string;
    }

    export interface Users {
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

    export interface ChannelMembers {
        channelId: Id;
        userId: Id;
    }

    export interface Messages {
        id: Id;
        channelId: Id;
        parentMessageId?: Id;
        senderId?: Id;
        text?: string;
        createdAt: Date;
        updatedAt: Date;
    }

    export interface AudioAttachments {
        id: Id;
        messageId?: Id;
        binaryContent?: any;
    }

    export interface ImageAttachments {
        id: Id;
        messageId?: Id;
        binaryContent?: any;
    }

    export interface MessageReactions {
        messageId: Id;
        reactionId: Id;
    }
}