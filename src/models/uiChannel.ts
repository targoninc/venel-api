import {Channel} from "../features/database/models";
import {SafeUser} from "../features/authentication/actions";

export interface UiChannel extends Channel {
    members: SafeUser[];
}