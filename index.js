require("dotenv").config();

const needle = require("needle");
const tmi = require("tmi.js");
const LeagueJS = require("leaguejs");
const chalk = require("chalk");
const { MongoClient } = require("mongodb");
const MongoDBclient = new MongoClient(process.env.DATABASEURL);
const Bot = require("./auth/thebrightcandle.json");
const Dino = require("./auth/dinoosaaw.json");
const moment = require("moment");
const { EmbedBuilder, WebhookClient } = require("discord.js");
const webhookClient = new WebhookClient({ url: process.env.webhookurl });
let leagueJs = new LeagueJS(process.env.RIOTAPI);
let CLIENTS = [];
let steamer = []

class TwitchChatLib {
  async onConnectedHandler(addr, port) {
    let message = chalk.grey(`[${moment().format("LLLL")}] `);
    message += chalk.hex("6441a5")(`[~~~~~~~~~] `);
    message += chalk.hex("a970ff")(`| #TWITCH | `);
    message += `Succeeded to connect to ${addr}:${port}`;
    console.log(message);

    const online = new EmbedBuilder()
      .setTitle("Online")
      .setDescription(`**${Bot.identity.username}** Is Now Online!`)
      .setColor("#82f282")
      .setTimestamp()
      .setThumbnail(
        "https://static-cdn.jtvnw.net/jtv_user_pictures/cf9fd0fb-7bbd-4ff1-a678-0f8ba6e33796-profile_image-70x70.png"
      );
    // webhookClient
      // .send({ embeds: [online] })
      // .then(
        (message = chalk.grey(`[${getTimestamp()}] `)),
        (message += chalk.hex("6441a5")(`[~~~~~~~~~] `)),
        (message += chalk.hex("7289da")(`| #DISCORD | `)),
        (message += `Online Webhook successfully sent`),
        console.log(message)
      // )
      // .catch((err) => console.log(err));
  }

  async onDisconnectedHandler(reason) {
    let message = chalk.grey(`[${moment().format("LLLL")}] `);
    message += chalk.hex("6441a5")(`[~~~~~~~~~] `);
    message += chalk.hex("a970ff")(`| #TWITCH | `);
    message += chalk.red.bold(`Disconnected!`);
    message += reason;
    console.log(message);

    const disconnected = new EmbedBuilder()
      .setTitle("Disconnected")
      .setDescription(`**${Bot.identity.username}** has disconnected`)
      .setColor("RED")
      .setTimestamp()
      .setThumbnail(
        "https://static-cdn.jtvnw.net/jtv_user_pictures/cf9fd0fb-7bbd-4ff1-a678-0f8ba6e33796-profile_image-70x70.png"
      );
    webhookClient
      .send({ embeds: [disconnected] })
      .then(
        (message = chalk.grey(`[${getTimestamp()}] `)),
        (message += chalk.hex("6441a5")(`[~~~~~~~~~] `)),
        (message += chalk.hex("7289da")(`| #DISCORD | `)),
        (message += `disconnected Webhook successfully sent`),
        console.log(message)
      )
      .catch((err) => console.log(err));
  }

  async onBotMessageHandler(target, context, message, self) {
    let msg = message.toLowerCase();

    const botmessageDataBase = await settingsDataBaseQuery({ _id: "botmsgs" });
    if (botmessageDataBase == null) {
      return console.error("Failed to get botmsg");
    }
    let check = botmessageDataBase.msg.filter((word) => msg.includes(word));
    if (check.length > 0) {
      if (context.mod) return;

      CLIENTS["SELF"].ban(target, context["display-name"], `trigger phrase: ${check} || automated by TheBrightCandle`).catch(err(console.log(err)));

      const bannedmsg = new EmbedBuilder()
        .setTitle("Banned")
        .setDescription(
          `**${
            context["display-name"]
          }** has been auto banned in __[${target}](https://twitch.tv/${RemoveHashtag(
            target
          )})'s__ channel \n Trigger Phase -> **${check}**`
        )
        .setColor("RED")
        .setTimestamp();
      webhookClient
        .send({ embeds: [disconnected] })
        .then(
          (message = chalk.grey(`[${getTimestamp()}] `)),
          (message += chalk.hex("6441a5")(`[~~~~~~~~~] `)),
          (message += chalk.hex("7289da")(`| #DISCORD | `)),
          (message += `Banned Webhook successfully sent`),
          console.log(message)
        )
        .catch((err) => console.log(err));
    }
  }

  async onMessageHandler(target, context, message, self) {
    let db = await streamerDataBaseQuery({ _id: RemoveHashtag(target) });
    let msg = message.toLowerCase();
    let colour;
    let ID = "000000000";
    let bannableMsg;
    let action;
    let timeoutableMsg;

    if (context["custom-reward-id"]) {
      console.log(`custom reward id is present:`, context["custom-reward-id"]);
    }
    if (context.badges !== null) {
      // console.log(context.badges);
    }

    switch (context["message-type"]) {
      case "action":
        if (context["user-id"] !== undefined) {
          ID = context["user-id"];
        }
        action = chalk.grey(`[${getTimestamp()}] `);
        action += chalk.hex("6441a5")(`[${ID}]`);
        if (db) {
          action += chalk.hex(db.colour)(` | ${target} |`);
        } else {
          action += chalk.hex(
            "#" +
              ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0")
          )(` | ${target} |`);
        }
        if (RemoveHashtag(target) == context["display-name"].toLowerCase()) {
          action += chalk.hex("e91916")(` {STREAMER}`);
        }
        if (context.mod) {
          action += chalk.hex("06af09")(` {MOD}`);
        }
        if (context.vip) {
          action += chalk.hex("e005b9")(` {VIP}`);
        }
        if (context.subscriber) {
          if (context.badges.subscriber > 1) {
            action += chalk.hex("e006b9")(
              ` {SUB of ${context.badges.subscriber}}`
            );
          } else {
            action += chalk.hex("e006b9")(` {SUB}`);
          }
        }
        if (context.turbo) {
          action += chalk.hex("59399a")(` {TURBO}`);
        }
        if (context.badges !== null) {
          if (context.badges.premium) {
            action += chalk.hex("01a0d6")(` {PRIME}`);
          }
          if (context.badges.partner) {
            action += chalk.hex("9146ff")(` {PARTNER}`);
          }
          if (context.badges.bits) {
            let bitcolour = GetBitColour(context.badges.bits);
            action += chalk.hex(bitcolour)(` {BITS: ${context.badges.bits}}`);
          }
          if (context.badges["artist-badge"]) {
            action += chalk.hex("1e69ff")(` {ARTIST}`);
          }
        }
        colour = context.color;
        if (!colour)
          colour =
            "#" +
            ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0");
        action += chalk.hex(colour)(` ${context["display-name"]}`);
        action += chalk.hex(colour)(` || `);
        action += msg;
        console.log(action);
        break;
      case "chat":
        if (context["user-id"] !== undefined) {
          ID = context["user-id"];
        }
        action = chalk.grey(`[${getTimestamp()}] `);
        action += chalk.hex("6441a5")(`[${ID}]`);
        if (db) {
          action += chalk.hex(db.colour)(` | ${target} |`);
        } else {
          action += chalk.hex(
            "#" +
              ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0")
          )(` | ${target} |`);
        }
        if (RemoveHashtag(target) == context["display-name"].toLowerCase()) {
          action += chalk.hex("e91916")(` {STREAMER}`);
        }
        if (context.mod) {
          action += chalk.hex("06af09")(` {MOD}`);
        }
        if (context.vip) {
          action += chalk.hex("e005b9")(` {VIP}`);
        }
        if (context.subscriber) {
          if (context.badges.subscriber > 1) {
            action += chalk.hex("e006b9")(
              ` {SUB of ${context.badges.subscriber}}`
            );
          } else {
            action += chalk.hex("e006b9")(` {SUB}`);
          }
        }
        if (context.turbo) {
          action += chalk.hex("59399a")(` {TURBO}`);
        }
        if (context.badges !== null) {
          if (context.badges.premium) {
            action += chalk.hex("01a0d6")(` {PRIME}`);
          }
          if (context.badges.partner) {
            action += chalk.hex("9146ff")(` {PARTNER}`);
          }
          if (context.badges.bits) {
            let bitcolour = GetBitColour(context.badges.bits);
            action += chalk.hex(bitcolour)(` {BITS: ${context.badges.bits}}`);
          }
          if (context.badges["artist-badge"]) {
            action += chalk.hex("1e69ff")(` {ARTIST}`);
          }
        }
        colour = context.color;
        if (!colour)
          colour =
            "#" +
            ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0");
        action += chalk.hex(colour)(` ${context["display-name"]}`);
        action += chalk.hex(colour)(` || `);
        action += msg;
        console.log(action);
        break;
      case "whisper":
        let whisper = chalk.grey(`[${getTimestamp()}] `);
        whisper += `[${context["user-id"]}]`;
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

    BannableMsgCheck(msg, context, target);
    timeoutableMsgCheck(msg, context, target);

    if (msg.startsWith("!")) {
      if (target == Bot.channels[4] || target == Bot.channels[0]) {
        let args = message.split(" ");
        let commandName = args[0].slice(1);
        let mentionUser = args[1];
        let Author = context["display-name"];

        let commandDB = await commandDataBaseQuery({ aliases: commandName });
        if (!commandDB)
          return console.log(chalk.white("Failed to load command ") + chalk.bold.red(commandName));
        if (commandDB.name.startsWith("-"))
          return console.log(chalk.bold.red(commandName) + chalk.white(" has been disabled"));
        if (commandDB) console.log(chalk.bold.greenBright(commandName) + chalk.white(" successfully loaded"));
        switch (commandDB.name) {
          case "command":
            let names = ""
            let database = MongoDBclient.db("twitch");
            let settingsDataBase = database.collection("commands");
            let result = await settingsDataBase.find().toArray(function(err, result) {
              
              if (err) throw err;
              let names = "";
              // iterate through each element of the array and add the value name to a string
              result.forEach(function(doc, index) {
                if (doc.name.startsWith("-")) return
                names += doc.name;
                if (index !== result.length - 1) {
                  names += ", ";
                }
              });
              CLIENTS["BOT"].action(
                target,
                `This channel has access to the following commands: ${names}`
                );
            })
            break;

          case "rank":
            let rankinfo = await GetRank()
            CLIENTS["BOT"].say(target, rankinfo);
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

          case "lurk":
            CLIENTS["BOT"].action(target, Author + commandDB.data);
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
          
          case "hug":
            if (!mentionUser) return;
            if (args.count < 2) return;
            CLIENTS["BOT"].say(
              target,
              `/me ${Author} gives a big old hug to ${mentionUser} <3`
            );
            break;

          case "title":
              if (args.count != 1) {
                ReadTitle(target).then((title) => {
                CLIENTS["BOT"].say(target, `The title is: ${title}!`)
              })
              } else {
                CLIENTS["BOT"].say(target, `Invalid 2Outh Token`);
              }
              break;
            
          case "game":
              console.log("lol");
              if (args.count != 1) {
                ReadGame(target).then((game) => {
                  CLIENTS["BOT"].say(target, `The game is: ${game}!`)
                })
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
            if (mentionUser) Author = mentionUser
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

          case "so":
            if (!mentionUser) mentionUser = Author
            if (modCheck(context, target)) {
              ReadGame(mentionUser).then((game) => {
                CLIENTS["BOT"].say(target, `Everyone go check out ${mentionUser}! They're an awesome person and deserve all the support! And they been playing ${game}`);

              })
            }
            break;

          case "gang":
            CLIENTS["BOT"].say(
              target,
              `${RemoveHashtag(target)} is playing with ${commandDB.data}`
            );
            break;

          case "cmd":
            if (modCheck(context, target) == false) return
            let cmdDatabase = MongoDBclient.db("twitch");
            let CmdsettingsDataBase = cmdDatabase.collection("commands");
            let commandDB2 = await CmdsettingsDataBase.findOne({ name: args[2] });
            let filter = { name: args[2] };
            let options = { upsert: false };
            
              switch(args[1]){

                case "create":
                  if(commandDB2) return
                  let NewCommandName = args[2]
                  let NewCommandData = ""
                    for (let i = 3; i < args.length; i += 1) {
                      NewCommandData += `${args[i]} `;
                    }


                    const newCommand = {
                      name: NewCommandName,
                      data: NewCommandData,
                      aliases: [ NewCommandName ]
                    }
                  if (commandDB2) return

                  const newdoc = await CmdsettingsDataBase.insertOne(newCommand);
                  CLIENTS["BOT"].say(target, `A command was added with the name of ${NewCommandName}`)
                  break;
                case "disable":
                  if(!commandDB2) return console.log("failed to find command")
                  console.log("enable command")
                   
                   let disableDoc = {
                    $set: {
                      name: "-" + commandDB2.name
                    },
                  };
                  let disableCommand = CmdsettingsDataBase.updateOne(filter, disableDoc, options);
                  CLIENTS["BOT"].say(target, `${commandDB2.name} was disabled`)
                  break;
                case "enable":
                  commandDB2 = await CmdsettingsDataBase.findOne({ name: "-" + args[2] });
                  if(!commandDB2) return console.log("failed to find command")
                  console.log("enable command")
                  filter = { name: "-" + args[2] };
                   let enableDoc = {
                    $set: {
                      name: commandDB2.name.replace("-", "")
                    },
                  };
                  let enableCommand = CmdsettingsDataBase.updateOne(filter, enableDoc, options);
                  CLIENTS["BOT"].say(target, `${commandDB2.name.replace("-", "")} was enable`)
                  break;
                case "edit":
                  if(!commandDB2) return console.log("failed to find command")
                  let editedCommandData = ""
                    for (let i = 3; i < args.length; i += 1) {
                      editedCommandData += `${args[i]} `;
                    }

                  let editedDoc = {
                      $set: {
                        data: editedCommandData
                      },
                    };
                    let editedCommand = CmdsettingsDataBase.updateOne(filter, editedDoc, options);
                    CLIENTS["BOT"].say(target, `${commandDB2.name} was edited`)
                  break;

              }
          break;

          default:
            if (commandDB.data === null) return console.log(chalk.white("Failed to load command ") + chalk.bold.red(commandName) + chalk.white(" missing command data"));
            CLIENTS["BOT"].say(target, commandDB.data);
            break;

        }
      }
    }
  }

  async onJoinHandler(channel, username, self) {
    let settingsdb = await settingsDataBaseQuery({ _id: "botaccounts" });
    let streamerdb = await streamerDataBaseQuery({
      _id: RemoveHashtag(channel),
    });
    if (self) {
      let msg = chalk.grey(`[${getTimestamp()}] `);
      msg += chalk.hex("6441a5")(`[~~~~~~~~~]`);
      msg += chalk.hex("a970ff")(` | #TWITCH | `);
      msg += `Successfully connected to: `;
      if (streamerdb) {
        msg += chalk.hex(streamerdb.colour)(channel);
      } else {
        msg += chalk.hex(
          "#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0")
        )(channel);
      }
      console.log(msg);
    } else if (settingsdb.accounts.includes(username)) return;
    else {
      let join = chalk.grey(`[${getTimestamp()}] `);
      join += chalk.hex("6441a5")(`[~~~~~~~~~]`);
      if (streamerdb) {
        join += chalk.hex(streamerdb.colour)(` | ${channel} |`);
      } else {
        join += chalk.hex(
          "#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0")
        )(` | ${channel} |`);
      }
      join += chalk.green` ${username} `;
      join += `Has joined`;
      console.log(join);
    }

    if (channel == "#slipsaus" && username == "slipsaus")
      return CLIENTS["DINO"].say(channel, "!dino");
    if (channel == "#apollopepsi" && username == "apollopepsi")
      return CLIENTS["DINO"].say(channel, "!dino");
    if (!streamerdb || streamerdb.welcomeMsg === false) return;
    else {
      switch (username) {
        case "dinoosaaw":
          CLIENTS["BOT"].say(channel, `/me Rawr!`);
          break;
        case "lightbylb":
          CLIENTS["BOT"].say(
            channel,
            `/me A light bulb creates an environment by its mere presence.!`
          );
          break;
        case "apollopepsi":
          CLIENTS["BOT"].say(
            channel,
            `/me Quick get the Eskie the Apollo Cans are here!`
          );
          break;
        case "meme_aids":
          CLIENTS["BOT"].say(
            channel,
            `/me AHH, Who left the Memes Aids Out Panic!`
          );
          break;
      }
    }
  }

  async onPartHandler(channel, username, self) {
    let settingsdb = await settingsDataBaseQuery({ _id: "botaccounts" });
    let streamerdb = await streamerDataBaseQuery({
      _id: RemoveHashtag(channel),
    });
    if (self) {
      let msg = chalk.grey(`[${getTimestamp()}] `);
      msg += chalk.hex("6441a5")(`[~~~~~~~~~]`);
      msg += chalk.hex("a970ff")(` | #TWITCH | `);
      msg += `Disconnected from: `;
      if (streamerdb) {
        msg += chalk.hex(streamerdb.colour)(channel);
      } else {
        msg += chalk.hex(
          "#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0")
        )(channel);
      }
      console.log(msg);
    } else if (settingsdb.accounts.includes(username)) return;
    else {
      let part = chalk.grey(`[${getTimestamp()}] `);
      part += chalk.hex("6441a5")(`[~~~~~~~~~]`);
      if (streamerdb) {
        part += chalk.hex(streamerdb.colour)(` | ${channel} |`);
      } else {
        part += chalk.hex(
          "#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0")
        )(` | ${channel} |`);
      }
      part += chalk.red` ${username} `;
      part += `Has left`;
      console.log(part);
    }
  }

  async onNoticeHandler(channel, msgid, message) {
    let notice = `[${getTimestamp()}] `;
    switch (msgid) {
      case "already_banned":
        notice += ` [000226633]`;
        notice += ` | ${channel} |`;
        notice += ` ${msgid} |`;
        notice += message;
        console.log(notice);
      default:
        notice += ` [000668423]`;
        notice += ` | ${channel} |`;
        notice += ` ${msgid} |`;
        notice += message;
        console.log(notice);
    }
  }

  async onAnonGiftPaidUpgradeHandler(channel, username, userstate) {
    let streamerdb = await streamerDataBaseQuery({
      _id: RemoveHashtag(channel),
    });
    let msg = chalk.grey(`[${getTimestamp()}] `);
    msg += chalk.hex("6441a5")`[~~~~~~~~~]`;
    if (streamerdb) {
      msg += chalk.hex(streamerdb.colour)(` | ${channel} |`);
    } else {
      msg += chalk.hex(
        "#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0")
      )(` | ${channel} |`);
    }
    msg += ` ${username} |`;
    msg += ` is continuing the Gift Sub they got from an anonymous user in channel.`;
    console.log(msg);
    console.log(userstate);
  }

  async onGiftPaidUpgradeHandler(channel, username, sender, userstate) {
    let streamerdb = await streamerDataBaseQuery({
      _id: RemoveHashtag(channel),
    });
    let msg = chalk.grey(`[${getTimestamp()}] `);
    msg += chalk.hex("6441a5")`[~~~~~~~~~]`;
    if (streamerdb) {
      msg += chalk.hex(streamerdb.colour)(` | ${channel} |`);
    } else {
      msg += chalk.hex(
        "#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0")
      )(` | ${channel} |`);
    }
    msg += ` ${username} |`;
    msg += ` is continuing the Gift Sub they got from ${sender}`;
    console.log(msg);
    console.log(userstate);
  }

  async onBanHandler(channel, username, reason, userstate) {
    let streamerdb = await streamerDataBaseQuery({
      _id: RemoveHashtag(channel),
    });
    let msg = chalk.grey(`[${getTimestamp()}] `);
    msg += chalk.hex("6441a5")`[~~~~~~~~~]`;
    if (streamerdb) {
      msg += chalk.hex(streamerdb.colour)(`| ${channel} |`);
    } else {
      msg += chalk.hex(
        "#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0")
      )(` | ${channel} |`);
    }
    msg += ` ${username} |`;
    msg += chalk.red(` Has been banned`);
    console.log(msg);
  }

  async onCheerHandler(channel, userstate, message) {
    let streamerdb = await streamerDataBaseQuery({
      _id: RemoveHashtag(channel),
    });
    let msg = chalk.grey(`[${getTimestamp()}] `);
    msg += chalk.hex("6441a5")`[~~~~~~~~~]`;
    if (streamerdb) {
      msg += chalk.hex(streamerdb.colour)(` | ${channel} |`);
    } else {
      msg += chalk.hex(
        "#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0")
      )(` | ${channel} |`);
    }
    msg += ` ${userstate.username} |`;
    msg += ` Cheered: ${userstate.bits} |`;
    msg += message;
    console.log(msg);
    console.log(userstate);
  }

  async onClearChatHandler(channel) {
    let streamerdb = await streamerDataBaseQuery({
      _id: RemoveHashtag(channel),
    });
    let msg = chalk.grey(`[${getTimestamp()}] `);
    msg += chalk.hex("6441a5")`[~~~~~~~~~]`;
    if (streamerdb) {
      msg += chalk.hex(streamerdb.colour)(` | ${channel} |`);
    } else {
      msg += chalk.hex(
        "#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0")
      )(` | ${channel} |`);
    }
    msg += ` Chat was cleared`;
    console.log(msg);
  }

  async onFollowerOnlyHandler(channel, enabled, length) {
    let streamerdb = await streamerDataBaseQuery({
      _id: RemoveHashtag(channel),
    });
    let msg = chalk.grey(`[${getTimestamp()}] `);
    msg += chalk.hex("6441a5")`[~~~~~~~~~]`;
    if (streamerdb) {
      msg += chalk.hex(streamerdb.colour)(` | ${channel} |`);
    } else {
      msg += chalk.hex(
        "#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0")
      )(` | ${channel} |`);
    }
    if (enabled === true) {
      msg += ` Follower Only has been turned on for user that have been following for ${length}mins`;
    } else {
      msg += ` Follower Only has been turned off`;
    }
    console.log(msg);
  }

  async onRaidedHandler(channel, username, viewers) {
    let streamerdb = await streamerDataBaseQuery({
      _id: RemoveHashtag(channel),
    });
    let msg = chalk.grey(`[${getTimestamp()}] `);
    msg += chalk.hex("6441a5")`[~~~~~~~~~]`;
    if (streamerdb) {
      msg += chalk.hex(streamerdb.colour)(` | ${channel} |`);
    } else {
      msg += chalk.hex(
        "#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0")
      )(` | ${channel} |`);
    }
    msg += `${username} `;
    msg += `Has Raided for ${viewers}`;
    console.log(msg);
  }

  async onResubHandler(channel, username, months, message, userstate, methods) {
    let cumulativeMonths = ~~userstate["msg-param-cumulative-months"];
    let streamerdb = await streamerDataBaseQuery({
      _id: RemoveHashtag(channel),
    });
    let msg = chalk.grey(`[${getTimestamp()}] `);
    msg += chalk.hex("6441a5")`[~~~~~~~~~]`;
    if (streamerdb) {
      msg += chalk.hex(streamerdb.colour)(` | ${channel} |`);
    } else {
      msg += chalk.hex(
        "#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0")
      )(` | ${channel} |`);
    }
    if (userstate.mod) {
      msg += chalk.hex("06af09")(` {MOD}`);
    }
    if (userstate.vip) {
      msg += chalk.hex("e005b9")(` {VIP}`);
    }
    if (userstate.subscriber) {
      if (userstate.badges.subscriber > 1) {
        msg += chalk.hex("e006b9")(
          ` {SUB of ${userstate["badge-info"].subscriber}}`
        );
      } else {
        msg += chalk.hex("e006b9")(` {SUB}`);
      }
    }
    if (userstate.turbo) {
      msg += chalk.hex("59399a")(` {TURBO}`);
    }
    if (userstate.badges !== null) {
      if (userstate.badges.premium) {
        msg += chalk.hex("01a0d6")(` {PRIME}`);
      }
      if (userstate.badges.partner) {
        msg += chalk.hex("9146ff")(` {PARTNER}`);
      }
      if (userstate.badges.bits) {
        let bitcolour = GetBitColour(context.badges.bits);
        msg += chalk.hex(bitcolour)(` {BITS: ${context.badges.bits}}`);
      }
      let colour = userstate.color;
      if (!colour)
        colour =
          "#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0");
        msg += chalk.hex(colour)(` ${username}`);
    }
    msg += ` Has Resubbed for ${months} months, currently on a ${cumulativeMonths} month streak! using ${userstate["msg-param-sub-plan"]} |`;
    msg += message;
    console.log(msg);
  }

  async onSlowModeHandler(channel, enabled, length) {
    let streamerdb = await streamerDataBaseQuery({
      _id: RemoveHashtag(channel),
    });
    let msg = chalk.grey(`[${getTimestamp()}] `);
    msg += chalk.hex("6441a5")`[~~~~~~~~~]`;
    if (streamerdb) {
      msg += chalk.hex(streamerdb.colour)(` | ${channel} |`);
    } else {
      msg += chalk.hex(
        "#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0")
      )(` | ${channel} |`);
    }
    if (enabled === true) {
      msg += ` Slow Mode has been turned on for user that have been following for ${length}`;
    } else {
      msg += ` Slow Mode has been turned off`;
    }
    console.log(msg);
  }

  async onSubGiftHandler(
    channel,
    username,
    streakMonths,
    recipient,
    methods,
    userstate
  ) {
    let streamerdb = await streamerDataBaseQuery({
      _id: RemoveHashtag(channel),
    });
    recipient = ~~userstate["msg-param-recipient-display-name"];
    let countofgiftsubs = ~~userstate["msg-param-sender-count"];
    let msg = chalk.grey(`[${getTimestamp()}] `);
    msg += chalk.hex("6441a5")`[~~~~~~~~~]`;
    if (streamerdb) {
      msg += chalk.hex(streamerdb.colour)(` | ${channel} |`);
    } else {
      msg += chalk.hex(
        "#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0")
      )(` | ${channel} |`);
    }
    msg += ` ${username} | `;
    msg += `Has gifted ${userstate["msg-param-recipient-user-name"]} a sub!`;
    console.log(msg);
  }

  async onSubMysteryGiftHandler(
    channel,
    username,
    numbOfSubs,
    methods,
    userstate
  ) {
    let streamerdb = await streamerDataBaseQuery({
      _id: RemoveHashtag(channel),
    });
    let senderCount = ~~userstate["msg-param-sender-count"];
    let msg = chalk.grey(`[${getTimestamp()}] `);
    msg += chalk.hex("6441a5")`[~~~~~~~~~]`;
    if (streamerdb) {
      msg += chalk.hex(streamerdb.colour)(` | ${channel} |`);
    } else {
      msg += chalk.hex(
        "#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0")
      )(` | ${channel} |`);
    }
    msg += ` ${username} | `;
    msg += `Has gifted ${numbOfSubs} using ${methods} this is they ${senderCount} gifted sub`;
    console.log(msg);
    console.log(userstate);
  }

  async OnSubscribersHandler(channel, enabled) {
    let streamerdb = await streamerDataBaseQuery({
      _id: RemoveHashtag(channel),
    });
    let msg = chalk.grey(`[${getTimestamp()}] `);
    msg += chalk.hex("6441a5")`[~~~~~~~~~]`;
    if (streamerdb) {
      msg += chalk.hex(streamerdb.colour)(` | ${channel} |`);
    } else {
      msg += chalk.hex(
        "#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0")
      )(` | ${channel} |`);
    }
    if (enabled === true) {
      msg += ` subscribers-only has been turned on`;
    } else {
      msg += ` subscribers-only has been turned off`;
    }
    console.log(msg);
  }

  async onSubscriptionHandler(channel, username, method, message, userstate) {
    let streamerdb = await streamerDataBaseQuery({
      _id: RemoveHashtag(channel),
    });
    let msg = chalk.grey(`[${getTimestamp()}] `);
    msg += chalk.hex("6441a5")`[~~~~~~~~~]`;
    if (streamerdb) {
      msg += chalk.hex(streamerdb.colour)(` | ${channel} |`);
    } else {
      msg += chalk.hex(
        "#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0")
      )(` | ${channel} |`);
    }
    if (userstate.mod) {
      msg += chalk.hex("06af09")(` {MOD}`);
    }
    if (userstate.vip) {
      msg += chalk.hex("e005b9")(` {VIP}`);
    }
    if (userstate.subscriber) {
      if (userstate.badges.subscriber > 1) {
        msg += chalk.hex("e006b9")(
          ` {SUB of ${userstate["badge-info"].subscriber}}`
        );
      } else {
        msg += chalk.hex("e006b9")(` {SUB}`);
      }
    }
    if (userstate.turbo) {
      msg += chalk.hex("59399a")(` {TURBO}`);
    }
    if (userstate.badges !== null) {
      if (userstate.badges.premium) {
        msg += chalk.hex("01a0d6")(` {PRIME}`);
      }
      if (userstate.badges.partner) {
        msg += chalk.hex("9146ff")(` {PARTNER}`);
      }
      if (userstate.badges.bits) {
        let bitcolour = GetBitColour(context.badges.bits);
        msg += chalk.hex(bitcolour)(` {BITS: ${context.badges.bits}}`);
      }
      let colour = userstate.color;
      if (!colour)
        colour =
          "#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0");
      msg += chalk.hex(colour)(` ${username}`);
    }
    msg += ` Subscribed using ${userstate["msg-param-sub-plan"]} ||`;
    msg += message;
    console.log(msg);
  }

  async onTimeoutHandler(channel, username, reason, duration, userstate) {
    let streamerdb = await streamerDataBaseQuery({
      _id: RemoveHashtag(channel),
    });
    let msg = chalk.grey(`[${getTimestamp()}] `);
    msg += chalk.hex("6441a5")`[~~~~~~~~~]`;
    if (streamerdb) {
      msg += chalk.hex(streamerdb.colour)(` | ${channel} |`);
    } else {
      msg += chalk.hex(
        "#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0")
      )(` | ${channel} |`);
    }
    msg += ` ${username} |`;
    msg += ` has been timed out for ${duration} seconds.`;
    console.log(msg);
  }
}

class BotClients {
  async twitchChat() {
    let tl = new TwitchChatLib();
    CLIENTS["BOT"] = new tmi.client(Bot);
    CLIENTS["DINO"] = new tmi.client(Dino);

    CLIENTS["BOT"].on("connected", tl.onConnectedHandler);
    CLIENTS["DINO"].on("message", tl.onBotMessageHandler);
    CLIENTS["BOT"].on("message", tl.onMessageHandler);
    CLIENTS["BOT"].on("join", tl.onJoinHandler);
    CLIENTS["BOT"].on("part", tl.onPartHandler);
    CLIENTS["BOT"].on("notice", tl.onNoticeHandler);
    CLIENTS["BOT"].on("anongiftpaidupgrade", tl.onAnonGiftPaidUpgradeHandler);
    CLIENTS["BOT"].on("giftpaidupgrade", tl.onGiftPaidUpgradeHandler);
    CLIENTS["BOT"].on("ban", tl.onBanHandler);
    CLIENTS["BOT"].on("cheer", tl.onCheerHandler);
    CLIENTS["BOT"].on("clearchat", tl.onClearChatHandler);
    CLIENTS["BOT"].on("followersonly", tl.onFollowerOnlyHandler);
    CLIENTS["BOT"].on("raided", tl.onRaidedHandler);
    CLIENTS["BOT"].on("resub", tl.onResubHandler);
    CLIENTS["BOT"].on("slowmode", tl.onSlowModeHandler);
    CLIENTS["BOT"].on("subgift", tl.onSubGiftHandler);
    CLIENTS["BOT"].on("submysterygift", tl.onSubMysteryGiftHandler);
    CLIENTS["BOT"].on("subscribers", tl.OnSubscribersHandler);
    CLIENTS["BOT"].on("subscription", tl.onSubscriptionHandler);
    CLIENTS["BOT"].on("timeout", tl.onTimeoutHandler);

    CLIENTS["BOT"].connect();
    CLIENTS["DINO"].connect();
  }
}

async function settingsDataBaseQuery(query) {
  let database = MongoDBclient.db("twitch");
  let settingsDataBase = database.collection("settings");
  let result = await settingsDataBase.findOne(query);
  
  return result;
}

async function commandDataBaseQuery(query) {
  let database = MongoDBclient.db("twitch");
  let settingsDataBase = database.collection("commands");
  let result = await settingsDataBase.findOne(query);
  
  return result;
}

async function streamerDataBaseQuery(query) {
  let database = MongoDBclient.db("twitch");
  let settingsDataBase = database.collection("streamers");
  let result = await settingsDataBase.findOne(query);
  
  return result;
}

function RemoveHashtag(channel) {
  let CleanChannelName = channel.replace("#", "");
  return CleanChannelName;
}

async function GetRank() {
  try {
    const data = await leagueJs.League.gettingLeagueEntriesForSummonerId(
      process.env.RIOTSUMMONERID,
      process.env.RIOTREGION
    );
    const [soloQ, flexQ] = data;
    const rankInfo = data.length === 1
      ? `${soloQ.queueType}: ${soloQ.tier} ${soloQ.rank} at ${soloQ.leaguePoints} LP.`
      : `${soloQ.queueType}: ${soloQ.tier} ${soloQ.rank} at ${soloQ.leaguePoints} LP. ${flexQ.queueType}: ${flexQ.tier} ${flexQ.rank} at ${flexQ.leaguePoints} LP.`;
    return rankInfo;
  } catch (error) {
    console.log(error);
    return "Error getting rank info";
  }
}

function ReadGame(target) {
  return new Promise((resolve, reject) => {
    needle(
      "get",
      `https://decapi.me/twitch/game/${RemoveHashtag(target)}`,
      function (error, response) {
        if (error) {
          reject(error);
        } else if (response.statusCode != 200) {
          reject(`API returned status code ${response.statusCode}`);
        } else {
          resolve(response.body);
        }
      }
    );
  });
}

function ReadTitle(target) {
  return new Promise((resolve, reject) => {
    needle(
      "get",
      `https://decapi.me/twitch/title/${RemoveHashtag(target)}`,
      function (error, response) {
        if (error) {
          reject(error);
        } else if (response.statusCode != 200) {
          reject(`API returned status code ${response.statusCode}`);
        } else {
          resolve(response.body);
        }
      }
    );
  });
}

async function BannableMsgCheck(msg, context, target) {
  const botmessageDataBase = await settingsDataBaseQuery({ _id: "bannedmsgs" });
  if (botmessageDataBase == null) {
    return console.error("Failed to get bannedmsgs");
  }
  let check = botmessageDataBase.msg.filter((word) => msg.includes(word));
  if (check.length > 0) {
    if (context.mod) return;
    CLIENTS["SELF"].ban(
      target,
      context["display-name"],
      `${context["display-name"]} has spoken the words that shall never been spoken | automated by TheBrightCandle`
    );
  }
}

async function timeoutableMsgCheck(msg, context, target) {
  const botmessageDataBase = await settingsDataBaseQuery({ _id: "timeoutmsg" });
  if (botmessageDataBase == null) {
    return console.error("Failed to get bannedmsgs");
  }
  let check = botmessageDataBase.msg.filter((word) => msg.includes(word));
  if (check.length > 0) {
    if (context.mod) return;
    CLIENTS["SELF"].timeout(
      target,
      context["display-name"],
      315,
      `${context["display-name"]} has spoken the words that shall never been spoken | automated by TheBrightCandle`
    );
  }
}

function getTimestamp() {
  moment.locale("en-au");
  let MomentTimestamp = moment().format("LTS");
  return MomentTimestamp;
}

function GetBitColour(bits) {
  if (bits >= "1000000") return "fecb11";
  if (bits >= "900000") return "16d03d";
  if (bits >= "800000") return "ff881f";
  if (bits >= "700000") return "c97ffd";
  if (bits >= "600000") return "ff281f";
  if (bits >= "500000") return "48acfe";
  if (bits >= "400000") return "47d7b4";
  if (bits >= "300000") return "cbc8d0";
  if (bits >= "200000") return "cbc8d0";
  if (bits >= "100000") return "fdca0f";
  if (bits >= "75000") return "16d03d";
  if (bits >= "50000") return "ff881f";
  if (bits >= "25000") return "f56eb2";
  if (bits >= "10000") return "fc2a2b";
  if (bits >= "5000") return "4eaefb";
  if (bits >= "1000") return "47d7b4";
  if (bits >= "100") return "c982fc";
  if (bits >= "1") return "ccc9d0";
}

function live(streamerName) {

  const options = {
    headers: {
      "Client-ID": Dino.identity.clientID,
      Authorization: "Bearer " + Dino.identity.twitchpassword
    }
  };

  needle.get(`https://api.twitch.tv/helix/streams?user_login=${streamerName}`, options, (err, res) => {
  if (err) {
    console.error(err);
  } else {
    if (!res.body.data) return false
    if (res.body.data.length == 0) {
      if(steamer.includes(streamerName)) {
        const index = steamer.indexOf(streamerName);
        if (index !== -1) {
          steamer.splice(index, 1);
        }
      }
      return false
    }
    if (steamer.includes(res.body.data[0].user_login)) return true
    else if (res.body.data) {
      steamer.push(res.body.data[0].user_login)
      return true
    }
  }
});
}

async function LiveCheck() {
  setTimeout(() => {
    setInterval(async () => {
      Dino.channels.forEach(name => {
        live(RemoveHashtag(name))
      });
      if (steamer.length) {
        const streamers = await Promise.all(
          steamer.map(async channel => {
            const streamerdb = await streamerDataBaseQuery({ _id: RemoveHashtag(channel) });
            if (streamerdb) {
              return {
                name: channel,
                color: streamerdb.colour
              };
            } else {
              return {
                name: channel,
                color: "#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0")
              };
            }
          })
        );

        let msg = chalk.grey(`[${getTimestamp()}] `);
        msg += chalk.hex("6441a5")(`[~~~~~~~~~]`);
        msg += chalk.hex("a970ff")(` | LIVE |`);

        streamers.forEach(streamer => {
          msg += chalk.hex(streamer.color)(` ${streamer.name} `);
        });

        msg += streamers.length === 1 ? "Is currently live" : "Are currently live";
        console.log(msg);
      }
    }, 60 * 1000 * 5);
  }, 30 * 1000);
}

function isNotEnglish(str) {
  return /[^\u0000-\u007F]+/.test(str);
}

function modCheck(user, channel) {
  return (user.mod || user.username === RemoveHashtag(channel))
}
let botclients = new BotClients();
botclients.twitchChat();
LiveCheck();