import {Id} from "../features/database/models";

export interface SafeUser {
    'id': Id;
    'username': string;
    'displayname': string | null;
    'createdAt': Date;
    'updatedAt': Date;
    'description': string | null;
    'archived': boolean;
}