const {Client, GatewayIntentBits, Collection, ButtonBuilder, ButtonStyle, ActionRowBuilder} = require("discord.js");
const IncludedIntents = Object.entries(GatewayIntentBits).reduce((t, [, V]) => t | V, 0);
const client = new Client({ intents: IncludedIntents});
const {readdirSync} = require("fs");
const { TOKEN } = require("./Bot/set/config");

module.exports = client;
client.setMaxListeners(0);
client.slashCommands = new Collection();
client.commands = new Collection()
client.aliases = new Collection()
readdirSync('./handlers').forEach((handler) => {
    require(`./handlers/${handler}`)(client)
  });
  require("./Log/bot_log")(client)
client.login(TOKEN).catch(err => {console.log("Bot Token Hatalı.")}).then(console.log("Token Başarılı"))


