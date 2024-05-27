import {User} from "../database/models";

export interface UserWebSocket extends WebSocket {
    user: User;
}