import {BridgeInstance} from "../features/database/models";
import {SafeUser} from "./safeUser";

export interface ViewableInstance extends BridgeInstance {
    allowlist: SafeUser[];
}