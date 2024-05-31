import {Permission, Role} from "../features/database/models";
import {SafeUser} from "./safeUser";

export interface AdminPanelUser extends SafeUser {
    'roles': Role[];
    'permissions': Permission[];
}