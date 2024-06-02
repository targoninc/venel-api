import {Message, Reaction} from "../features/database/models";

import {SafeUser} from "./safeUser";

export interface ReceivableMessage extends Message {
    sender: SafeUser;
    reactions: Reaction[];
}