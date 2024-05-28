import {Message} from "../features/database/models";
import {SafeUser} from "../features/authentication/actions";

export interface ReceivableMessage extends Message {
    sender: SafeUser;
}