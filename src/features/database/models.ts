/*
* This file was generated by a tool.
* Rerun "npm run models-from-database" to regenerate.
*/
export type Id = number;

export interface Attachment {
  'data': Buffer | null;
  'id': Id;
  'messageId': Id | null;
  'type': string;
}

export interface BridgedUser {
  'createdAt': Date;
  'instanceId': Id;
  'userId': Id;
}

export interface BridgeInstance {
  'enabled': boolean;
  'id': Id;
  'url': string;
  'useAllowlist': boolean;
}

export interface ChannelMember {
  'channelId': Id;
  'userId': Id;
}

export interface Channel {
  'bridged': boolean;
  'bridgedChannelId': Id | null;
  'bridgeInstanceId': Id | null;
  'createdAt': Date;
  'id': Id;
  'name': string | null;
  'type': string;
  'updatedAt': Date;
}

export interface MessageReaction {
  'messageId': Id;
  'reactionId': Id;
  'userId': Id;
}

export interface Message {
  'channelId': Id;
  'createdAt': Date;
  'id': Id;
  'parentMessageId': Id | null;
  'senderId': Id | null;
  'text': string | null;
  'updatedAt': Date;
}

export interface Permission {
  'description': string;
  'id': Id;
  'name': string;
}

export interface ReactionGroup {
  'display': string;
  'id': Id;
}

export interface Reaction {
  'content': string | null;
  'groupId': Id;
  'id': Id;
  'identifier': string | null;
}

export interface RolePermission {
  'permissionId': Id;
  'roleId': number;
}

export interface Role {
  'createdAt': Date;
  'description': string;
  'id': number;
  'name': string;
}

export interface UserRole {
  'createdAt': Date;
  'roleId': number;
  'userId': Id;
}

export interface User {
  'archived': boolean;
  'avatar': Buffer | null;
  'createdAt': Date;
  'description': string | null;
  'displayname': string | null;
  'id': Id;
  'lastLoginIp': string | null;
  'passwordHash': string;
  'phoneNumber': string | null;
  'registrationIp': string | null;
  'updatedAt': Date;
  'username': string;
}

export interface UserSetting {
  'createdAt': Date;
  'settingKey': string;
  'updatedAt': Date;
  'userId': Id;
  'value': string;
}

