import fs from "fs";
import {WritableAttachment} from "../../models/writableAttachment";
import {MariaDbDatabase} from "../database/mariaDbDatabase";
import {Attachment, Id} from "../database/models";
import {CLI} from "../../tooling/CLI";
import {Response} from "express";

export class AttachmentProcessor {
    static ensureMessageFolder(messageId: Id) {
        const fileFolder = process.env.FILE_FOLDER;
        if (!fileFolder) {
            throw new Error("FILE_FOLDER is not set");
        }
        if (!fs.existsSync(fileFolder)) {
            fs.mkdirSync(fileFolder);
        }
        const messageFolder = fileFolder + "/" + messageId;
        fs.mkdirSync(messageFolder);
    }

    static async saveAttachments(db: MariaDbDatabase, messageId: Id, attachments: WritableAttachment[]) {
        if (!attachments || attachments.length === 0) {
            return;
        }

        AttachmentProcessor.ensureMessageFolder(messageId);
        const messageFolder = process.env.FILE_FOLDER + "/" + messageId;
        for (const attachment of attachments) {
            if (attachment.data) {
                await this.saveAttachment(db, messageId, attachment, messageFolder);
            }
        }
    }

    static async saveAttachment(db: MariaDbDatabase, messageId: number, attachment: WritableAttachment, messageFolder: string) {
        await db.createAttachment(messageId, attachment.type, attachment.filename);
        const attachmentPath = messageFolder + "/" + attachment.filename;
        // @ts-ignore
        const data = Buffer.from(attachment.data, "base64");
        fs.writeFileSync(attachmentPath, data);
        CLI.debug(`Created attachment with length ${attachment.data?.length} of type ${attachment.type} at ${attachmentPath}`);
    }

    static async deleteMessage(messageId: number) {
        const messageFolder = process.env.FILE_FOLDER + "/" + messageId;
        if (fs.existsSync(messageFolder)) {
            fs.rmSync(messageFolder, {recursive: true, force: true});
        }
    }

    static pipeAttachment(res: Response, attachmentPath: string, messageAttachment: Attachment) {
        const stat = fs.statSync(attachmentPath);
        res.setHeader("Content-Type", messageAttachment?.type ?? "application/octet-stream");
        res.setHeader("Content-Length", stat.size);
        const stream = fs.createReadStream(attachmentPath);
        stream.pipe(res);
    }
}