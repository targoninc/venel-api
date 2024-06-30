import fs from "fs";
import {WritableAttachment} from "../../models/writableAttachment";
import {MariaDbDatabase} from "../database/mariaDbDatabase";
import {Attachment, Id} from "../database/models";
import {CLI} from "../../tooling/CLI";
import {Response} from "express";
import crypto from "crypto";

export class AttachmentProcessor {
    static getKey(password: string): Buffer {
        return crypto.scryptSync(password, 'salt', 24);
    }

    static encryptionType = "aes-192-cbc";

    static encrypt(buffer: Buffer, password: string) {
        const key = AttachmentProcessor.getKey(password);
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(AttachmentProcessor.encryptionType, key, iv);
        const content = Buffer.concat([cipher.update(buffer), cipher.final()]);
        return Buffer.concat([iv, content]);
    }

    static decrypt(buffer: Buffer, password: string) {
        const key = AttachmentProcessor.getKey(password);
        const iv = buffer.slice(0, 16);
        const content = buffer.slice(16);
        const decipher = crypto.createDecipheriv(AttachmentProcessor.encryptionType, key, iv);
        return Buffer.concat([decipher.update(content), decipher.final()]);
    }

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
        if (!process.env.FILE_PASSWORD) {
            throw new Error("FILE_PASSWORD is not set");
        }
        const password = process.env.FILE_PASSWORD;
        await db.createAttachment(messageId, attachment.type, attachment.filename);
        const attachmentPath = messageFolder + "/" + attachment.filename;
        // @ts-ignore
        let data = Buffer.from(attachment.data, "base64");
        data = AttachmentProcessor.encrypt(data, password);
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
        if (!process.env.FILE_PASSWORD) {
            throw new Error("FILE_PASSWORD is not set");
        }
        const password = process.env.FILE_PASSWORD;
        const encryptedData = fs.readFileSync(attachmentPath);
        const decryptedData = AttachmentProcessor.decrypt(encryptedData, password);

        res.setHeader("Content-Type", messageAttachment?.type ?? "application/octet-stream");
        res.setHeader("Content-Length", decryptedData.length);
        res.write(decryptedData);
        res.end();
    }
}