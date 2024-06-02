import {MariaDbDatabase} from "../database/mariaDbDatabase";
import {User} from "../database/models";
import {safeUser} from "../authentication/actions";
import {SafeUser} from "../../models/safeUser";
import {UiChannel} from "../../models/uiChannel";

export class ChannelProcessor {
    static async processChannel(channel: UiChannel, user: User | SafeUser, db: MariaDbDatabase, channelMembers?: User[]) {
        if (channel.type === "dm") {
            const previousName = channel.name;
            const members = channelMembers ?? await db.getChannelMembersAsUsers(channel.id);
            if (members) {
                for (const member of members) {
                    if (member.id !== user.id) {
                        channel.name = member.displayname ?? member.username;
                    }
                }
                if (channel.name === previousName) {
                    channel.name = "Note to self";
                }
                channel.members = members.map(safeUser);
            }
        }
        return channel;
    }
}