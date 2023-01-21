require("dotenv").config(); // Required for handling environment variables
const needle = require("needle"); // Required for HTTPS requests
const tmi = require("tmi.js"); // Required for connecting to Twitch's chat service
const LeagueJS = require("leaguejs"); // Required for League Rank Command
const chalk = require("chalk"); // Optional for colorizing
const { MongoClient } = require("mongodb"); // Required for connecting to MongoDB server and performing perform various operations such as CRUD
const Bot = require("./auth/thebrightcandle.json"); // JSON file for "BOT" client authentication
const Dino = require("./auth/dinoosaaw.json"); // JSON file for "DINO" client authentication
const MongoDBclient = new MongoClient(process.env.DATABASEURL); // Create a new MongoClient instance and connect to the MongoDB server using the URL stored in the DATABASEURL environment variable
const moment = require('moment'); // Required for creating timestamps

let leagueJs = new LeagueJS(process.env.RIOTAPI);
let CLIENTS = []; // An array to hold the clients

class TwitchChatLib {
  // Class for handling Twitch events

  async onConnectedHandler(addr, port) {
    // Event handler for "connected" event
    let message = chalk.grey(`[${getTimestamp()}] `)
    message += chalk.hex("6441a5")(`[000000000] `);
    message += chalk.hex("a970ff")(`| #TWITCH | `);
    message += `Succeeded to connect to ${addr}:${port}`;
    console.log(message);
  }

  async onDisconnectedHandler(reason) {
    // Event handler for "disconnected" event
    let message = chalk.grey(`[${getTimestamp()}] `)
    message += chalk.hex("6441a5")(`[000000000] `);
    message += chalk.hex("a970ff")(`| #TWITCH | `);
    message += chalk.red.bold(`Disconnected!`);
    message += reason;
    console.log(message);
  }

  async onBotMessageHandler(target, context, message, self) {
    let msg = message.toLowerCase(); // convert the message to lowercase

    const botmessageDataBase = await settingsDataBaseQuery({ _id: "botmsgs" }); // get the array of trigger words/phrases
    if (botmessageDataBase == null) {
      return console.error("Failed to get botmsg")
    }
    let check = botmessageDataBase.msg.filter((word) => msg.includes(word)); // check if the message contains any of the trigger words/phrases
    if (check.length > 0) {

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
    let bannableMsg; // bannableMsg variable is used to store a message that has violated community guidelines and may result in a ban for the user. 
    let timeoutableMsg; // timeoutableMsg variable is used to store a message that has violated community guidelines and may result in a timeout for the user.
    if (context["customr-reward-id"]) {
      // Check if a custom reward id is present,
      console.log(`custom reward id is present:`, context["customr-reward-id"]);
    }

    switch (context["message-type"]) {
      case "action":
        if (context["user-id"] !== undefined) {
          ID = context["user-id"]; // Assign the user ID to the ID variable
        }
        let action = chalk.grey(`[${getTimestamp()}] `);
        action += chalk.hex("6441a5")(`[${ID}]`);
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
            ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"); // If the color property is not present, assign a random color
        action += chalk.hex(colour)(` ${context["display-name"]}`);
        action += chalk.hex(colour)(` || `);
        action += msg;
        console.log(action);
        break;
      case "chat":
        if (context["user-id"] !== undefined) {
          ID = context["user-id"]; // Assign the user ID to the ID variable
        }
        let chat = chalk.grey(`[${getTimestamp()}] `);
        chat += chalk.hex("6441a5")(`[${ID}]`);
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
            ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"); // If the color property is not present, assign a random color
        chat += chalk.hex(colour)(` ${context["display-name"]}`);
        chat += chalk.hex(colour)(` || `);
        chat += msg;
        console.log(chat);
        break;
      case "whisper":
        let whisper = chalk.grey(`[${getTimestamp()}] `) // Assign the user ID to the ID variable
        whisper += `[${context["user-id"]}]`; // Assign the user ID to the ID variable
        whisper += ` {whisper} | ${context["display-name"].toLowerCase()}`; // Add the string '{whisper} | ' and the user's display name (converted to lowercase) to the 'whisper' variable
        whisper += ` || `;
        whisper += msg;
        console.log(whisper);
        break;
      default: // If the value of 'type' does not match any of the case values, the code in this block will execute
      // Log the entire 'context' variable to the console
        console.log(context);
        break;
    }

    if (self) return; // Check if the value of the 'self' variable is truthy, if so, return and exit the function

    BannableMsgCheck(msg, context, target)
    timeoutableMsgCheck(msg, context, target)
    
    if (msg.startsWith("!")) {
      // Check if the message starts with an exclamation point

      if (target == Bot.channels[0]) {
        // Check if the value of the 'target' variable is the same as the second element in the 'Bot.channels' array
        let args = msg.split(" "); // Split the message into an array of arguments using a space as the separator
        let commandName = args[0].slice(1); // Get the command name by slicing the Exclamation mark of the 'args'
        let mentionUser = args[1]; // Get the command name by slicing the Exclamation mark of the 'args'
        let Author = context["display-name"];

        let command = await commandDataBaseQuery({ aliases: commandName })
        if(command == null) return console.log("Failed to load command " + commandName)
        
        switch (
          commandName // Check the value of the 'commandName' variable
        ) {
          case "commands" || "command":
            CLIENTS["BOT"].say(
              target,
              `This channel has access to the following commands: `
            );
            break;

          case "uptime":
            let utime;
            await needle.get(
              `https://decapi.me/twitch/uptime/lightbylb`,
              function (error, response) {
                if (!error && response.statusCode == 200) utime = response.body;
                CLIENTS["BOT"].say(
                  target,
                  `This stream has been going for: ${utime}`
                );
              }
            );
            break;

          case "prime":
            CLIENTS["BOT"].say(
              target,
              `Subscribe and support ${RemoveHashtag(
                target
              )} with Twitch Prime! Every month, Twitch Prime members get a free subscription on Twitch.tv, exclusive in-game loot, free games PLUS all the benefits included with Amazon Prime. https://www.twitch.tv/prime`
            );
            break;

          case "lurk":
            CLIENTS["BOT"].say(
              target,
              `/me ${Author} ${command.data}`
            );
            break;

          case "sub" || "subscribe":
            CLIENTS["BOT"].say(
              target,
              `https://www.twitch.tv/subs/${RemoveHashtag(target)}!`
            );
            break;

          case "time":
            let time;
            await needle.get(
              `https://www.timeapi.io/api/Time/current/zone?timeZone=Australia/Melbourne`,
              function (error, response) {
                if (!error && response.statusCode == 200)
                  CLIENTS["BOT"].say(
                    target,
                    `The time for ${RemoveHashtag(target)} is ${
                      response.body.time
                    } on ${response.body.date}!`
                  );
              }
            );
            break;

          case "tip":
            CLIENTS["BOT"].say(
              target,
              `You can tip here: https://streamlabs.com/${RemoveHashtag(
                target
              )}/tip!`
            );

            break;
          
          case "tiktok":
            CLIENTS["BOT"].say(
              target,
              command.data
            );
            break;

          case "hug":
            if (!mentionUser) return;
            if (args.count < 2) return;
            CLIENTS["BOT"].say(
              target,
              `/me ${Author} gives a big old hug to ${mentionUser} <3`
            );
            break;

          case "discord":
            CLIENTS["BOT"].say(
              target,
              command.data
            );
            break;

          case "rank":
            CLIENTS["BOT"].say(target, GetRank());
            break;

          case "dino":
            CLIENTS["BOT"].say(target, command.data);
            break;

          case "game":
            if (args.count < 1 || !context.mod) {
              ReadGame(target);
            } else {
              CLIENTS["BOT"].say(target, `Invalid 2Outh Token`);
            }
            break;

          case "title":
            if (args.count < 1 || !context.mod) {
              ReadTitle(target);
            } else {
              CLIENTS["BOT"].say(target, `Invalid 2Outh Token`);
            }
            break;

          case "brightness":
            CLIENTS["BOT"].say(
              target,
              `${Author} is illuminating ${Math.floor(
                Math.random() * 3000
              )} lumens`
            );
            break;

          case "followerage" || "followage":
            needle(
              "get",
              `https://decapi.me/twitch/followage/lightbylb/${Author}`,
              function (error, response) {
                if (!error && response.statusCode == 200)
                  CLIENTS["BOT"].say(
                    target,
                    `${Author} has been following for ${response.body}!`
                  );
              }
            );
            break;

          case "commercial" || "ads":
            CLIENTS["BOT"].say(
              target,
              command.data
            );
            if (context.mod) {
              CLIENTS["LIGHT"].commercial("channel", 120).then((data) => {
                console.log(
                  `[TWITCH] Commercial ran in ${data.channel} for ${data.seconds}sec`
                );
              });
            }
            break;

          case "so" || "shoutout":
            if (context.mod) {
              CLIENTS["BOT"].say(target, `/shoutout ${Author}`);
            }
            break;

          case "bttv" || "7tv" || "ffz":
            CLIENTS["BOT"].say(
              target,
              command.data
            );
            break;

          case "gang" || "squad" || "duo" || "playingwith":
            CLIENTS["BOT"].say(
              target,
              `${RemoveHashtag(target)} is playing with ${command.data}`
            );
            break;

          case "pride":
            CLIENTS["BOT"].say(
              target,
              command.data
            );
            break;

          case "uwu":
            CLIENTS["BOT"].say(
              target,
              command.data
            );
            break;

          case "delay":
            CLIENTS["BOT"].say(
              target,
              command.data
            );
            break;

          case "english":
            CLIENTS["BOT"].say(
              target,
              `This is a english stream please refrain from speaking a differnt langThis is a english stream please refrain from speaking a different language`
            );
            break;

          case "drops":
            CLIENTS["BOT"].say(target, command.data);
            break;
        }
      }
    }
  }

  async onJoinHandler(channel, username, self) {
    let db = await settingsDataBaseQuery({ _id: "botaccounts"})
    if (self) {
      let msg = chalk.grey(`[${getTimestamp()}] `);
      msg += chalk.hex("6441a5")(`[000000000]`);
      msg += chalk.hex("a970ff")(` | #TWITCH | `);
      msg += `Successfully connected to: `;
      msg += chalk.hex(
        "#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0")
      )(channel);
      console.log(msg);
    }
    else if (username == "dinoosaaw") return
    else if (db.accounts.includes(username)) return
    else {
      let join = chalk.grey(`[${getTimestamp()}] `)
      join += chalk.hex("6441a5")(`[000000000]`);
      join += chalk.hex("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))(` | ${channel} | `);
      join += chalk.green`${username} `
      join += `Has joined`
      console.log(join);
  }
  }

  async onPartHandler(channel, username, self) {

    let db = await settingsDataBaseQuery({ _id: "botaccounts"})
    if (self) {
      let msg = chalk.grey(`[${getTimestamp()}] `)
      msg += chalk.hex("6441a5")(`[000000000]`);
      msg += chalk.hex("a970ff")(` | #TWITCH | `);
      msg += `Disconnected from: `;
      msg += chalk.hex(
        "#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0")
      )(channel);
      console.log(msg); 
    }
    else if (username == "dinoosaaw") return
    else if (db.accounts.includes(username)) return
    else {
      let part = chalk.grey(`[${getTimestamp()}] `)
      part += chalk.hex("6441a5")(`[000000000]`);
      part += chalk.hex("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"))(` | ${channel} | `);
      part += chalk.red`${username} `
      part += `Has left`
      console.log(part);
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
    CLIENTS["BOT"].on("message", tl.onMessageHandler); // asasing the "onMessageHandler" to the "message" event
    CLIENTS["BOT"].on("join", tl.onJoinHandler); // asasing the "onMessageHandler" to the "message" event
    CLIENTS["BOT"].on("part", tl.onPartHandler); // asasing the "onMessageHandler" to the "message" event

    CLIENTS["BOT"].connect(); // connect the "BOT" client
    CLIENTS["DINO"].connect(); // connect the "DINO" client
  }
}

async function settingsDataBaseQuery(query) {
    let database = MongoDBclient.db("twitch"); // Select the "twitch" database
    let settingsDataBase = database.collection("settings"); // Select the "settings" collection
    let result = await settingsDataBase.findOne(query); // Perform a findOne query on the "settings" collection using the provided query object
    return result; // Return the result of the query
}

async function commandDataBaseQuery(query) {
  let database = MongoDBclient.db("twitch"); // Select the "twitch" database
  let settingsDataBase = database.collection("commands"); // Select the "commands" collection
  let result = await settingsDataBase.findOne(query);
  return result; // Return the result of the query
}

function RemoveHashtag(channel) {
  let CleanChannelName = channel.replace("#", ""); // Create a variable to store the cleaned channel name
  return CleanChannelName; // Return the cleaned channel name
}

async function GetRank() {
  await leagueJs.League.gettingLeagueEntriesForSummonerId(
    // This function uses the leagueJs library to get the rank of a summoner based on their summoner ID and region
    process.env.RIOTSUMMONERID,
    process.env.RIOTREGION
  ).then((data) => {
    "use strict";
    if ((data = null)) return (Rank = "Unranked"); // If data is null, the summoner is unranked
    console.log(data);
    return `Solo/Duo: ${data[0].tier} ${data[0].rank} at ${data[0].leaguePoints} LP. Flex: ${data[1].tier} ${data[1].rank} at ${data[1].leaguePoints}LP `; // Return a string that displays the summoner's solo/duo and flex rank, as well as their LP
  });
}

function ReadGame(target) {
  needle(
    "get",
    `https://decapi.me/twitch/game/${RemoveHashtag(target)}`,
    function (error, response) {
      // This function uses the needle library to make a GET request to the decapi.me Twitch API
      if (!error && response.statusCode == 200)
        // Check for errors and a successful status code
        CLIENTS["BOT"].say(target, `The game is: ${response.body}!`); // Use the say method from the CLIENTS object to send a message to the target channel
    }
  );
}

function ReadTitle(target) {
  needle(
    "get",
    `https://decapi.me/twitch/title/${RemoveHashtag(target)}`,
    function (error, response) {
      if (!error && response.statusCode == 200)
        CLIENTS["BOT"].say(target, `The title is: ${response.body}!`);
    }
  );
}

async function BannableMsgCheck(msg, context, target) {
  const botmessageDataBase = await settingsDataBaseQuery({ _id: "bannedmsgs" }); // get the array of trigger words/phrases
  if (botmessageDataBase == null) {
    return console.error("Failed to get bannedmsgs")
  }
  let check = botmessageDataBase.msg.filter((word) => msg.includes(word)); // check if the message contains any of the trigger words/phrases
  if (check.length > 0) {

    if (context.mod) return; // check if the sender is a moderator, if so return
    CLIENTS["SELF"].ban(target, context["display-name"], `${context["display-name"]} has spoken the words that shall never been spoken | automated by TheBrightCandle`)
  }
}

async function timeoutableMsgCheck(msg, context, target) {
  const botmessageDataBase = await settingsDataBaseQuery({ _id: "timeoutmsg" }); // get the array of trigger words/phrases
  if (botmessageDataBase == null) {
    return console.error("Failed to get bannedmsgs")
  }
  let check = botmessageDataBase.msg.filter((word) => msg.includes(word)); // check if the message contains any of the trigger words/phrases
  if (check.length > 0) {
    
    if (context.mod) return; // check if the sender is a moderator, if so return
    CLIENTS["SELF"].timeout(target, context["display-name"], 315, `${context["display-name"]} has spoken the words that shall never been spoken | automated by TheBrightCandle`)
  }
}

function getTimestamp() {
  let MomentTimestamp = moment().format('HH:MM:SS').toString()  // This function uses the moment.js library to get the current timestamp
  return MomentTimestamp.toString() // Return the timestamp as a string
}

let botclients = new BotClients(); // create a new instance of BotClients
botclients.twitchChat(); // call the twitchChat method.