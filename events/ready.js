const client = require("..");
const {ActivityType} = require("discord.js");

client.on("ready", () => {


client.user.setActivity({type: ActivityType.Playing, name:`Yakında Sizlerle (Soon you)`});
client.user.setStatus("idle");
console.log("Bot Active");

})

