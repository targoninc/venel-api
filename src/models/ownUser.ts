import {Permission, Role, User} from "../features/database/models";

export interface OwnUser extends User {
    'roles': Role[];
    'permissions': Permission[];
    'settings': {
        [key: string]: any;
    }
}