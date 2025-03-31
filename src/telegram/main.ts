import { TelegramClient} from "telegram";
import { StringSession } from "telegram/sessions";
import { NewMessage, NewMessageEvent} from "telegram/events";
import dotenv from 'dotenv';
dotenv.config()
import Database from 'better-sqlite3';
import {predict} from "../classifier/classifier";
import {where} from "../where/where";
import logger from "../logger/logger";

const db = new Database('db.sqlite');
const apiId = Number(process.env["TELEGRAM_API_ID"])!
const apiHash = process.env["TELEGRAM_API_HASH"]!
const stringSession = new StringSession(process.env["TELEGRAM_SESSION"]!)

const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
});


export async function main() {
    await client.connect();
    logger.info("Telegram client connected")
    // setup event listener on newMesage for the client
    client.addEventHandler(eventPrint, new NewMessage({
        chats : ["-4268347199", "-1001445992030"]
    }));
    // create a table with two columns one for timestamp one for message
    db.prepare('CREATE TABLE IF NOT EXISTS messages (timestamp INTEGER, message TEXT, relevant BOOLEAN, stop TEXT NULL)').run();
}




// define the event handler
async function eventPrint(event : NewMessageEvent) {
    const message  = event.message;
    // triage with claassifier
   const prediction =  await predict(message.message)
    if (prediction == 0) {
        logger.info("Message : ", message.message + " classed as non-relevant")
        db.prepare('INSERT INTO messages (timestamp, message, relevant, stop) VALUES (?, ?, ?, null)').run([message.date, message.message, 0]);
        return
    }
    // find the best stop
    const stop = where(message.message)
    logger.info("Message : ", message.message + " classed as : ", stop)
    db.prepare('INSERT INTO messages (timestamp, message, relevant, stop) VALUES (?, ?, ? , ?)').run([message.date, message.message, 1, stop.name]);
}
