import {Channel} from "../features/database/models";

import {SafeUser} from "./safeUser";

export interface UiChannel extends Channel {
    members: SafeUser[];
}