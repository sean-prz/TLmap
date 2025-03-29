import { TelegramClient} from "telegram";
import { StringSession } from "telegram/sessions";
import { NewMessage, NewMessageEvent} from "telegram/events";
import dotenv from 'dotenv';
dotenv.config()
import Database from 'better-sqlite3';

const db = new Database('db.sqlite', { verbose: console.log });
const apiId = Number(process.env["TELEGRAM_API_ID"])!
const apiHash = process.env["TELEGRAM_API_HASH"]!
const stringSession = new StringSession(process.env["TELEGRAM_SESSION"]!)

const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
});


export async function main() {
    await client.connect();
    console.log("You should now be connected.");
    // setup event listener on newMesage for the client
    client.addEventHandler(eventPrint, new NewMessage({
        chats : ["-4268347199", "-1001445992030"]
    }));
    // create a table with two columns one for timestamp one for message
    db.prepare('CREATE TABLE IF NOT EXISTS messages (timestamp INTEGER, message TEXT)').run();
}




// define the event handler
async function eventPrint(event : NewMessageEvent) {
    console.log(event)
    console.log(event.chatId)
    const message  = event.message;
    console.log(message.message);
    db.prepare('INSERT INTO messages (timestamp, message) VALUES (?, ?)').run([message.date, message.message]);
}
