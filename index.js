module.exports = require('./mongoose/mongoose.js');

require("dotenv").config();

const tmi = require("tmi.js");

const Bot = require("./auth/thebrightcandle.json")
const Dino = require("./auth/dinoosaaw.json")

let CLIENTS = [];

class TwitchChatLib {

    async onConnectedHandler(addr, port) {
        console.log("Connected", addr, port);
    }


}



class BotClients {
    async twitchChat() {
    let tl = new TwitchChatLib();
    CLIENTS["BOT"] = new tmi.client(Bot);
    CLIENTS["DINO"] = new tmi.client(Dino);

    CLIENTS["BOT"].on("connected", tl.onConnectedHandler);

    CLIENTS["BOT"].connect();
    CLIENTS["DINO"].connect();
    }
}

let botclients = new BotClients();
botclients.twitchChat();