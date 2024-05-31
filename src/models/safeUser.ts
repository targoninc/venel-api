import {Id} from "../features/database/models";

export interface SafeUser {
    'id': Id;
    'username': string;
    'avatar': string | null;
    'displayname': string | null;
    'createdAt': Date;
    'updatedAt': Date;
    'description': string | null;
    'archived': boolean;
}

