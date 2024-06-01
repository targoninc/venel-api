set global net_buffer_length = 1000000;
set global max_allowed_packet = 1000000000;

CREATE SCHEMA IF NOT EXISTS venel;

create or replace table bridgeInstances
(
    id           bigint auto_increment
        primary key,
    url          varchar(512)         not null,
    enabled      tinyint(1) default 1 not null,
    useAllowlist tinyint(1) default 1 not null,
    constraint bridgeInstances_pk_2
        unique (url)
);

create or replace table channels
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
        foreign key (bridgeInstanceId) references bridgeInstances (id)
            on delete set null
);

create or replace table permissions
(
    id          bigint auto_increment
        primary key,
    name        varchar(255)            not null,
    description varchar(512) default '' not null,
    constraint permissions_pk
        unique (name)
);

create or replace table reactions
(
    id      bigint auto_increment
        primary key,
    content varchar(255) null
);

create or replace table roles
(
    id          int auto_increment
        primary key,
    name        varchar(255)                             not null,
    description varchar(512) default ''                  not null,
    createdAt   datetime     default current_timestamp() not null,
    constraint roles_pk
        unique (name)
);

create or replace table rolePermissions
(
    roleId       int    not null,
    permissionId bigint not null,
    primary key (permissionId, roleId),
    constraint rolePermissions_permissions_id_fk
        foreign key (permissionId) references permissions (id)
            on delete cascade,
    constraint rolePermissions_roles_id_fk
        foreign key (roleId) references roles (id)
            on delete cascade
);

create or replace table users
(
    id             bigint auto_increment
        primary key,
    username       varchar(255)                           not null,
    phoneNumber    varchar(255)                           null,
    avatar         mediumblob                             null,
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

create or replace table bridgedUsers
(
    instanceId bigint                               not null,
    userId     bigint                               not null,
    createdAt  datetime default current_timestamp() not null,
    primary key (instanceId, userId),
    constraint bridgedUsers_bridgeInstances_id_fk
        foreign key (userId) references bridgeInstances (id)
            on delete cascade,
    constraint bridgedUsers_users_id_fk
        foreign key (instanceId) references users (id)
            on delete cascade
);

create or replace table channelMembers
(
    channelId bigint not null,
    userId    bigint not null,
    primary key (channelId, userId),
    constraint channelMembers_channels_id_fk
        foreign key (channelId) references channels (id)
            on delete cascade,
    constraint channelMembers_users_id_fk
        foreign key (userId) references users (id)
            on delete cascade
);

create or replace table messages
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
        foreign key (channelId) references channels (id)
            on delete cascade,
    constraint messages_ibfk_1
        foreign key (parentMessageId) references messages (id)
            on delete set null,
    constraint messages_ibfk_2
        foreign key (senderId) references users (id)
            on delete cascade
);

create or replace table audioAttachments
(
    id            bigint auto_increment
        primary key,
    messageId     bigint     null,
    binaryContent mediumblob null,
    constraint audioAttachments_ibfk_1
        foreign key (messageId) references messages (id)
            on delete cascade
);

create or replace index messageId
    on audioAttachments (messageId);

create or replace table imageAttachments
(
    id            bigint auto_increment
        primary key,
    messageId     bigint     null,
    binaryContent mediumblob null,
    constraint imageAttachments_ibfk_1
        foreign key (messageId) references messages (id)
            on delete cascade
);

create or replace index messageId
    on imageAttachments (messageId);

create or replace table messageReactions
(
    messageId  bigint not null,
    reactionId bigint not null,
    primary key (messageId, reactionId),
    constraint messageReactions_ibfk_1
        foreign key (messageId) references messages (id)
            on delete cascade,
    constraint messageReactions_ibfk_2
        foreign key (reactionId) references reactions (id)
            on delete cascade
);

create or replace index reactionId
    on messageReactions (reactionId);

create or replace index parentMessageId
    on messages (parentMessageId);

create or replace index senderId
    on messages (senderId);

create or replace table userRoles
(
    userId    bigint                               not null,
    roleId    int                                  not null,
    createdAt datetime default current_timestamp() not null,
    constraint userRoles_roles_id_fk
        foreign key (roleId) references roles (id)
            on delete cascade,
    constraint userRoles_users_id_fk
        foreign key (userId) references users (id)
            on delete cascade
);

