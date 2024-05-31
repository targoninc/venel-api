CREATE SCHEMA IF NOT EXISTS venel;

create table if not exists venel.bridgeInstances
(
    id           bigint auto_increment
        primary key,
    url          varchar(512)         not null,
    useAllowlist tinyint(1) default 1 not null,
    constraint bridgeInstances_pk_2
        unique (url)
);

create table if not exists venel.channels
(
    id               bigint auto_increment
        primary key,
    type             varchar(2)                             not null,
    bridged          tinyint(1) default 0                   not null,
    bridgeInstanceId bigint                                 null,
    bridgedChannelId bigint                                 null,
    name             varchar(255)                           null,
    createdAt        datetime   default current_timestamp() not null,
    updatedAt        datetime   default current_timestamp() not null on update current_timestamp(),
    constraint channels_bridgeInstances_id_fk
        foreign key (bridgeInstanceId) references venel.bridgeInstances (id)
);

create table if not exists venel.permissions
(
    id          bigint auto_increment
        primary key,
    name        varchar(255)            not null,
    description varchar(512) default '' not null,
    constraint permissions_pk
        unique (name)
);

create table if not exists venel.reactions
(
    id      bigint auto_increment
        primary key,
    content varchar(255) null
);

create table if not exists venel.roles
(
    id          int auto_increment
        primary key,
    name        varchar(255)                             not null,
    description varchar(512) default ''                  not null,
    createdAt   datetime     default current_timestamp() not null,
    constraint roles_pk
        unique (name)
);

create table if not exists venel.rolePermissions
(
    roleId       int    not null,
    permissionId bigint not null,
    primary key (permissionId, roleId),
    constraint rolePermissions_permissions_id_fk
        foreign key (permissionId) references venel.permissions (id)
            on delete cascade,
    constraint rolePermissions_roles_id_fk
        foreign key (roleId) references venel.roles (id)
            on delete cascade
);

create table if not exists venel.users
(
    id             bigint auto_increment
        primary key,
    username       varchar(255)                           not null,
    phoneNumber    varchar(255)                           null,
    avatar mediumblob null,
    passwordHash   varchar(64)                            not null,
    displayname    varchar(255)                           null,
    description    text                                   null,
    createdAt      timestamp  default current_timestamp() not null,
    updatedAt      timestamp  default current_timestamp() not null on update current_timestamp(),
    registrationIp varchar(128)                           null,
    lastLoginIp    varchar(128)                           null,
    archived       tinyint(1) default 0                   not null,
    constraint username
        unique (username)
);

create table if not exists venel.bridgedUsers
(
    instanceId bigint not null,
    userId     bigint not null,
    primary key (instanceId, userId),
    constraint bridgedUsers_bridgeInstances_id_fk
        foreign key (userId) references venel.bridgeInstances (id)
            on delete cascade,
    constraint bridgedUsers_users_id_fk
        foreign key (instanceId) references venel.users (id)
            on delete cascade
);

create table if not exists venel.channelMembers
(
    channelId bigint not null,
    userId    bigint not null,
    primary key (channelId, userId),
    constraint channelMembers_channels_id_fk
        foreign key (channelId) references venel.channels (id)
            on delete cascade,
    constraint channelMembers_users_id_fk
        foreign key (userId) references venel.users (id)
            on delete cascade
);

create table if not exists venel.messages
(
    id              bigint auto_increment
        primary key,
    channelId       bigint                                not null,
    parentMessageId bigint                                null,
    senderId        bigint                                null,
    text            text                                  null,
    createdAt       timestamp default current_timestamp() not null,
    updatedAt       timestamp default current_timestamp() not null on update current_timestamp(),
    constraint messages_channels_id_fk
        foreign key (channelId) references venel.channels (id)
            on delete cascade,
    constraint messages_ibfk_1
        foreign key (parentMessageId) references venel.messages (id),
    constraint messages_ibfk_2
        foreign key (senderId) references venel.users (id)
);

create table if not exists venel.audioAttachments
(
    id            bigint auto_increment
        primary key,
    messageId     bigint     null,
    binaryContent mediumblob null,
    constraint audioAttachments_ibfk_1
        foreign key (messageId) references venel.messages (id)
);

create index if not exists messageId
    on venel.audioAttachments (messageId);

create table if not exists venel.imageAttachments
(
    id            bigint auto_increment
        primary key,
    messageId     bigint     null,
    binaryContent mediumblob null,
    constraint imageAttachments_ibfk_1
        foreign key (messageId) references venel.messages (id)
);

create index if not exists messageId
    on venel.imageAttachments (messageId);

create table if not exists venel.messageReactions
(
    messageId  bigint not null,
    reactionId bigint not null,
    primary key (messageId, reactionId),
    constraint messageReactions_ibfk_1
        foreign key (messageId) references venel.messages (id),
    constraint messageReactions_ibfk_2
        foreign key (reactionId) references venel.reactions (id)
);

create index if not exists reactionId
    on venel.messageReactions (reactionId);

create index if not exists parentMessageId
    on venel.messages (parentMessageId);

create index if not exists senderId
    on venel.messages (senderId);

create table if not exists venel.userRoles
(
    userId    bigint                               not null,
    roleId    int                                  not null,
    createdAt datetime default current_timestamp() not null,
    constraint userRoles_roles_id_fk
        foreign key (roleId) references venel.roles (id)
            on delete cascade,
    constraint userRoles_users_id_fk
        foreign key (userId) references venel.users (id)
            on delete cascade
);

