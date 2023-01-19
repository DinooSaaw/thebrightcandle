module.exports = require('./mongoose/mongoose.js'); // Exports the mongoose module

require("dotenv").config(); // Required for handling environment variables

const tmi = require("tmi.js"); // Required for connecting to Twitch's chat service

const Bot = require("./auth/thebrightcandle.json") // JSON file for "BOT" client authentication
const Dino = require("./auth/dinoosaaw.json") // JSON file for "DINO" client authentication

let CLIENTS = [];  // An array to hold the clients
 
class TwitchChatLib { // Class for handling Twitch events

    async onConnectedHandler(addr, port) { // Event handler for "connected" event
        console.log("Connected", addr, port);
    }

    async onDisconnectedHandler(reason) { // Event handler for "disconnected" event
        console.log("Disconnected", reason);
    }
}



class BotClients { // Class for creating and managing the Twitch clients

    async twitchChat() {
    let tl = new TwitchChatLib();
    CLIENTS["BOT"] = new tmi.client(Bot);  // create new "BOT" client with the Bot authentication
    CLIENTS["DINO"] = new tmi.client(Dino); // create new "DINO" client with the Dino authentication

    CLIENTS["BOT"].on("connected", tl.onConnectedHandler); // assign the "onConnectedHandler" to the "connected" event

    CLIENTS["BOT"].connect();  // connect the "BOT" client
    CLIENTS["DINO"].connect(); // connect the "DINO" client
    }
}

let botclients = new BotClients(); // create a new instance of BotClients
botclients.twitchChat(); // call the twitchChat method.