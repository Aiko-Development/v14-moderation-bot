const client = require("..");
const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle} = require("discord.js")
const {JsonProvider} = require("ervel.db");
const { BOTSUPPORT, BOTINVITE } = require("../Bot/set/links");
 const db = new JsonProvider("./DataBase/lang.json",".")


 async function getServerLanguage(guildId) {
    const lang = await db.fetch(`lang_${guildId}`);
    return lang || 'en'; 
}

client.on('messageCreate', async message => {
    const guildId = message.guild.id;
    const lang = await getServerLanguage(guildId);
    const mention = new RegExp(`^<@!?${client.user.id}>( |)$`);
	if(message.author.bot) return;

    var text1 = lang === 'en' ? `Hi, I think you tagged me \`${message.author.username}\`. My commands are only used with \`/\`. If you need more help, don't forget to come to my support server.`:`Selam galiba beni etiketledin \`${message.author.username}\`. Komutlarım sadece \`/\` ile kullanılmaktadır. Daha Fazla yardıma ihtiyacın varsa destek sunucuma gelmeyi unutma.`

if(message.content.match(mention)){
var but = new ButtonBuilder()
.setURL(BOTINVITE)
.setStyle(5)

.setLabel(lang === "en" ? 'Invite Me' : 'Davet Linkim')
.setEmoji("1147272026432753725")


var suports = new ButtonBuilder()
.setEmoji("1027286275016888320")
.setLabel(lang === 'en' ? 'Support Server':'Destek Sununcum')
.setURL(BOTSUPPORT)
.setStyle(5)



var row = new ActionRowBuilder()
.addComponents(but, suports)
var embs = new EmbedBuilder()
.setAuthor({name: lang === 'en' ? `Hi ${message.author.tag}`: `Selam ${message.author.tag}`, iconURL: message.author.displayAvatarURL({dyanmic:true})})
.setColor("Blue")
.setDescription(text1)
.setThumbnail(client.user.displayAvatarURL())
.setTimestamp()
.setFooter({text: lang==='en' ? `Developed by furkibu_.`:`furkibu_ Tarafından geliştiriliyor.`, iconURL: message.author.displayAvatarURL({dynamic:true})})

message.reply({embeds: [embs], components:[row]})



}})