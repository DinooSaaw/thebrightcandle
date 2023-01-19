module.exports = require("./mongoose/mongoose.js"); // Exports the mongoose module

require("dotenv").config(); // Required for handling environment variables

const tmi = require("tmi.js"); // Required for connecting to Twitch's chat service
const chalk = require("chalk"); // Optional for colorizing
const { MongoClient } = require("mongodb"); // Required for connecting to MongoDB server and performing perform various operations such as CRUD
const Bot = require("./auth/thebrightcandle.json"); // JSON file for "BOT" client authentication
const Dino = require("./auth/dinoosaaw.json"); // JSON file for "DINO" client authentication

let CLIENTS = []; // An array to hold the clients

class TwitchChatLib {
  // Class for handling Twitch events

  async onConnectedHandler(addr, port) {
    // Event handler for "connected" event
    let message = chalk.hex("6441a5")(`[000000000] `);
    message += chalk.hex("a970ff")(`| #TWITCH | `);
    message += `Succeeded to connect to ${addr}:${port}`;
    console.log(message);
  }

  async onDisconnectedHandler(reason) {
    // Event handler for "disconnected" event
    let message = chalk.hex("6441a5")(`[000000000] `);
    message += chalk.hex("a970ff")(`| #TWITCH | `);
    message += chalk.red.bold(`Disconnected!`);
    message += reason;
    console.log(message);
  }

  async onBotMessageHandler(target, context, message, self) {
    let msg = message.toLowerCase(); // convert the message to lowercase

    const botmessageDataBase = await settingsDataBaseQuery({ _id: "botmsgs" }); // get the array of trigger words/phrases
    let check = botmessageDataBase.msg.filter((word) => msg.includes(word)); // check if the message contains any of the trigger words/phrases
    if (check.length > 0) {
      console.log("onBotMessageHandler Trigged");

      if (context.mod) return; // check if the sender is a moderator, if so return

      CLIENTS["SELF"]
        .ban(
          target,
          context["display-name"],
          `trigger phrase: ${check} | automated by TheBrightCandle`
        )
        .catch(err(console.log(err))); // ban the user who sent the message, providing the trigger phrase and the automated source
    }
  }

  async onMessageHandler(target, context, message, self) {
    let msg = message.toLowerCase(); // Declare twitchat message in lowercase
    let colour; // Declare a variable to store the color of the user
    let ID = "000000000"; // Declare an ID variable and set it to a default value
    if (context["customr-reward-id"]) { // Check if a custom reward id is present,
      console.log(context["customr-reward-id"]);
    }

    switch (context["message-type"]) { 
      case "action":
        if (context["user-id"] !== undefined) { 
          ID = context["user-id"]; // Assign the user ID to the ID variable
        }
        let action = chalk.hex("6441a5")(`[${ID}]`);
        action += chalk.hex(
          "#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0")
        )(` | ${target} |`); // Assign a random color code to the target
        if (RemoveHashtag(target) == context["display-name"].toLowerCase()) {
            action += chalk.hex("e91916")(` {STREAMER}`); // If the message is from the streamer, add a label
        }
        if (context.mod) {
            action += chalk.hex("06af09")(` {MOD}`); // If the message is from a moderator, add a label
        }
        if (context.subscriber) {
            action += chalk.hex("e006b9")(` {SUB}`); // If the message is from a subscriber, add a label
        }
        if (context.turbo) {
            action += chalk.hex("59399a")(` {TURBO}`); // If the message is from a turbo user, add a label
        }
        colour = context.color;
        if (!colour)
          colour =
            "#" +
            ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0");  // If the color property is not present, assign a random color
            action += chalk.hex(colour)(` ${context["display-name"]}`);
            action += chalk.hex(colour)(` || `);
            action += msg;
        console.log(action);
        break;
      case "chat":
        if (context["user-id"] !== undefined)  {
          ID = context["user-id"]; // Assign the user ID to the ID variable
        }
        let chat = chalk.hex("6441a5")(`[${ID}]`);
        chat += chalk.hex(
          "#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0")
        )(` | ${target} |`); // Assign a random color code to the target
        if (RemoveHashtag(target) == context["display-name"].toLowerCase()) {
            chat += chalk.hex("e91916")(` {STREAMER}`); // If the message is from the streamer, add a label
        }
        if (context.mod) {
            chat += chalk.hex("06af09")(` {MOD}`); // If the message is from a moderator, add a label
        }
        if (context.subscriber) {
            chat += chalk.hex("e006b9")(` {SUB}`); // If the message is from a subscriber, add a label
        }
        if (context.turbo) {
            chat += chalk.hex("59399a")(` {TURBO}`); // If the message is from a turbo user, add a label
        } 
        colour = context.color;
        if (!colour)
          colour =
            "#" +
            ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0");  // If the color property is not present, assign a random color
        chat += chalk.hex(colour)(` ${context["display-name"]}`);
        chat += chalk.hex(colour)(` || `);
        chat += msg;
        console.log(chat);
        break;
      case "whisper":
        let whisper = `[${context["user-id"]}]`;
        whisper += ` {whisper} | ${context["display-name"].toLowerCase()}`;
        whisper += ` || `;
        whisper += msg;
        console.log(whisper);
        break;
      default:
        console.log(context);
        break;
    }

    if (self) return;
    if (msg.startsWith("!")) {
    }
  }
}

class BotClients {
  // Class for creating and managing the Twitch clients

  async twitchChat() {
    let tl = new TwitchChatLib();
    CLIENTS["BOT"] = new tmi.client(Bot); // create new "BOT" client with the Bot authentication
    CLIENTS["DINO"] = new tmi.client(Dino); // create new "DINO" client with the Dino authentication

    CLIENTS["BOT"].on("connected", tl.onConnectedHandler); // assign the "onConnectedHandler" to the "connected" event
    CLIENTS["DINO"].on("message", tl.onBotMessageHandler); // asasing the "onBotMessageHandler" to the "message" event
    CLIENTS["DINO"].on("message", tl.onMessageHandler); // asasing the "onMessageHandler" to the "message" event

    CLIENTS["BOT"].connect(); // connect the "BOT" client
    CLIENTS["DINO"].connect(); // connect the "DINO" client
  }
}

async function settingsDataBaseQuery(query) {
  const MongoDBclient = new MongoClient(process.env.DATABASEURL); // Create a new MongoClient instance and connect to the MongoDB server using the URL stored in the DATABASEURL environment variable
  try {
    let database = MongoDBclient.db("twitch"); // Select the "twitch" database
    let settingsDataBase = database.collection("settings"); // Select the "settings" collection
    let result = await settingsDataBase.findOne(query);  // Perform a findOne query on the "settings" collection using the provided query object
    return result;   // Return the result of the query
  } finally {
    // Ensures that the client will close when you finish/error
    await MongoDBclient.close();
  }
}

function RemoveHashtag(channel) {
  let CleanChannelName = channel.replace("#", ""); // Create a variable to store the cleaned channel name
  return CleanChannelName;  // Return the cleaned channel name
}

let botclients = new BotClients(); // create a new instance of BotClients
botclients.twitchChat(); // call the twitchChat method.
