const { ApplicationCommandType, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const {JsonProvider} = require("ervel.db");
const { vote_emoji } = require('../../Bot/emojis/info');
 const db = new JsonProvider("./DataBase/lang.json")


async function getServerLanguage(guildId) {
    const lang = await db.fetch(`lang_${guildId}`);
    return lang || 'en'; 
}

module.exports = {
    name: 'vote',
    description: "Check bot's vote links.",
    type: ApplicationCommandType.ChatInput,
    cooldown: 3000,
    run: async (client, interaction) => {
        const guildId = interaction.guild.id;
        const lang = await getServerLanguage(guildId);

        let vote1 = new ButtonBuilder()
            .setStyle(5)
            .setLabel(lang === 'en' ? "Vote Link" : "Oy Ver Linki")
            .setEmoji("📎")
            .setURL("https://top.gg/bot/798621154680111116/vote")
            .setDisabled(true)
    
        let row = new ActionRowBuilder()
            .addComponents(vote1);
    
        let vote = new EmbedBuilder()
            .setAuthor({ name: lang === 'en' ? "Vote Link" : "Oy Ver Linki", iconURL: client.user.avatarURL(), url: "https://top.gg/bot/798621154680111116/vote" })
            .setColor("Random") 
            .setThumbnail(`https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWMeT-_Jo7_8q3HAHw5ZRcGJEkiLnlJeQK27RgO8so2Q&s`)
            .setDescription(`${vote_emoji} ${lang === 'en' ? "Hello here is my vote [link](https://top.gg/bot/798621154680111116/vote)" : "Merhaba, işte benim oy [linkim](https://top.gg/bot/798621154680111116/vote)"}`)
        
        interaction.reply({ embeds: [vote], components: [row] });
    }
};
