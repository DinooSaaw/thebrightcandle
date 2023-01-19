module.exports = require('./mongoose/mongoose.js'); // Exports the mongoose module

require("dotenv").config(); // Required for handling environment variables

const tmi = require("tmi.js"); // Required for connecting to Twitch's chat service
const chalk = require("chalk"); // Optional for colorizing
const { MongoClient } = require('mongodb'); // Required for connecting to MongoDB server and performing perform various operations such as CRUD
const Bot = require("./auth/thebrightcandle.json") // JSON file for "BOT" client authentication
const Dino = require("./auth/dinoosaaw.json"); // JSON file for "DINO" client authentication

let CLIENTS = [];  // An array to hold the clients

class TwitchChatLib { // Class for handling Twitch events

    async onConnectedHandler(addr, port) { // Event handler for "connected" event
        let message = chalk.hex("6441a5")(`[000000000] `);
        message += chalk.hex("a970ff")(`| #TWITCH | `)
        message += (`Succeeded to connect to ${addr}:${port}`)
        console.log(message);
    }

    async onDisconnectedHandler(reason) { // Event handler for "disconnected" event
        let message = chalk.hex("6441a5")(`[000000000] `);
        message += chalk.hex("a970ff")(`| #TWITCH | `)
        message += chalk.red.bold(`Disconnected!`)
        message += reason;
        console.log(message);
    }

    async onBotMessageHandler(target, context, message, self) {
        let msg = message.toLowerCase(); // convert the message to lowercase

        const botmessageDataBase = await settingsDataBaseQuery({ _id: 'botmsgs' }) // get the array of trigger words/phrases
        let check = botmessageDataBase.msg.filter(word => msg.includes(word)); // check if the message contains any of the trigger words/phrases
        if(check.length > 0) {
            console.log("onBotMessageHandler Trigged");

            if (context.mod) return; // check if the sender is a moderator, if so return

            CLIENTS["SELF"].ban(target, context["display-name"], `trigger phrase: ${check} | automated by TheBrightCandle`).catch((err) (console.log(err))); // ban the user who sent the message, providing the trigger phrase and the automated source
        }
    }

}



class BotClients { // Class for creating and managing the Twitch clients

    async twitchChat() {
    let tl = new TwitchChatLib();
    CLIENTS["BOT"] = new tmi.client(Bot);  // create new "BOT" client with the Bot authentication
    CLIENTS["DINO"] = new tmi.client(Dino); // create new "DINO" client with the Dino authentication

    CLIENTS["BOT"].on("connected", tl.onConnectedHandler); // assign the "onConnectedHandler" to the "connected" event
    CLIENTS["DINO"].on("message", tl.onBotMessageHandler); // asasing the "onBotMessageHandler" to the "message" event

    CLIENTS["BOT"].connect();  // connect the "BOT" client
    CLIENTS["DINO"].connect(); // connect the "DINO" client
    }
}

async function settingsDataBaseQuery(query) {
    const MongoDBclient = new MongoClient(process.env.DATABASEURL);
    try {
        let database = MongoDBclient.db('twitch')
        let settingsDataBase = database.collection('settings')
        let result = await settingsDataBase.findOne(query);
        // console.log(result)
        return result
    } finally {
        // Ensures that the client will close when you finish/error
        // await MongoDBclient.close();
      }
}

let botclients = new BotClients(); // create a new instance of BotClients
botclients.twitchChat(); // call the twitchChat method.