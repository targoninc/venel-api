import {Attachment} from "../features/database/models";

export interface WritableAttachment extends Attachment {
    data: Buffer | null;
}