const client = require("..");
const {EmbedBuilder} = require("discord.js")
module.exports = (client) => {
client.on("guildCreate", async guild => {
 
    const name = guild.name;
    const id = guild.id;
    const memberCount = guild.memberCount;
    const owner = await guild.fetchOwner(); 
    const boost = guild.premiumTier;
    const categories = guild.channels.cache.filter(c => c.type === 'GUILD_CATEGORY').map(c => c.name).join(', ');
    const textChannels = guild.channels.cache.filter(c => c.type === 'GUILD_TEXT').map(c => c.name).join(', ');
    const voiceChannels = guild.channels.cache.filter(c => c.type === 'GUILD_VOICE').map(c => c.name).join(', ');
    const stageChannels = guild.channels.cache.filter(c => c.type === 'GUILD_STAGE_VOICE').map(c => c.name).join(', ');
    const announcementChannels = guild.channels.cache.filter(c => c.type === 'GUILD_NEWS').map(c => c.name).join(', ');
    const rulesChannel = guild.rulesChannel ? guild.rulesChannel.name : 'None';
    const afkChannel = guild.afkChannel ? guild.afkChannel.name : 'None';

   
    const embed = new EmbedBuilder()
        .setTitle('Joined a New Server!')
        .setColor('#00FF00')
        .setThumbnail(guild.iconURL({ dynamic: true }) || "https://www.pngitem.com/pimgs/m/240-2404350_stop-hand-png-don-t-be-tardy-for.png")
        .addFields(
            { name: 'Server Name', value: name, inline: true },
            { name: 'Server ID', value: id, inline: true },
            {name:`Server created`,value:`<t:${Math.floor(guild.createdTimestamp / 1000)}>(<t:${Math.floor(guild.createdTimestamp / 1000)}:R>)`,inline:true},
            { name: 'Member Count', value: `${memberCount}`, inline: true },
            { name: 'Server Owner', value: `${owner.user.tag}`, inline: true },
            { name: 'Boost Level', value: `${boost}`, inline: true },
            { name: 'Categories', value: categories || 'None', inline: true },
            { name: 'Text Channels', value: textChannels || 'None', inline: true },
            { name: 'Voice Channels', value: voiceChannels || 'None', inline: true },
            { name: 'Stage Channels', value: stageChannels || 'None', inline: true },
            { name: 'Announcement Channels', value: announcementChannels || 'None', inline: true },
            { name: 'Rules Channel', value: rulesChannel, inline: true },
            { name: 'AFK Channel', value: afkChannel, inline: true }
        )
        .setTimestamp();

    
    const logChannel = client.channels.cache.get("1275827218240507914"); 
   
        logChannel.send({ embeds: [embed] });
    
});




client.on("guildDelete", async guild => {
try {
    const name = guild.name;
    const id = guild.id;
    const memberCount = guild.memberCount;
    const owner = await guild.fetchOwner(); 


    const embed = new EmbedBuilder()
        .setTitle('Left a Server!')
        .setColor('#FF0000') 
        .setThumbnail(guild.iconURL({ dynamic: true } ) || "https://www.pngitem.com/pimgs/m/240-2404350_stop-hand-png-don-t-be-tardy-for.png") 
        .addFields(
            { name: 'Server Name', value: name, inline: true },
            { name: 'Server ID', value: id, inline: true },
            { name: 'Member Count', value: `${memberCount}`, inline: true },
            { name: 'Server Owner', value: `${owner.user.tag}`, inline: true }
        )
        .setTimestamp();

  
    const logChannel = client.channels.cache.get("1275827218240507914"); 
    if (logChannel) {
        logChannel.send({ embeds: [embed] });
    }
} catch (error) {
    console.error('Guild Delete Error:', error);
}
});

}

process.on("unhandledRejection", (err) => {
    console.log(err); 
var embs = new EmbedBuilder()
.setColor("Red")
.setDescription(`<:anime_thoughtful:1182388198098354217> **Yeni Hata!**`)
.addFields({name:`Hata Kodu: 1`, value:`\`\`\`${err}\`\`\``})
.setTimestamp()
.setThumbnail(client.user.avatarURL({dynamic:true}))
client.channels.cache.get("1275827218240507914").send({embeds : [embs], content:`Yeni Hata:`})
      });
  process.on("uncaughtException", (err) => {
  console.log(err)

  var embss = new EmbedBuilder()
  .setColor("Red")
  .setDescription(`<:anime_thoughtful:1182388198098354217> **Yeni Hata!**`)
  .addFields({name:`Hata Kodu: 2`, value:`\`\`\`${err}\`\`\``})
  .setTimestamp()
  .setThumbnail(client.user.avatarURL({dynamic:true}))
  client.channels.cache.get("1275827218240507914").send({embeds : [embss], content:`Yeni Hata:`})
  });



  