const { ApplicationCommandType, EmbedBuilder } = require('discord.js');
const {JsonProvider} = require("ervel.db")
 const db = new JsonProvider("./DataBase/lang.json")

async function getServerLanguage(guildId) {
    const lang = await db.fetch(`lang_${guildId}`);
    return lang || 'en'; 
}

module.exports = {
    name: 'ping',
    description: "Check bot's ms(ping).",
    type: ApplicationCommandType.ChatInput,
    cooldown: 3000,
    run: async (client, interaction) => {
        const guildId = interaction.guild.id;
        const lang = await getServerLanguage(guildId);

        let start = Date.now();
        
        let pingMessage = '';
        if (lang === 'en') {
            pingMessage = `
                :ping_pong: **Bot ping:** \`${Math.round(client.ws.ping)}ms\`
                :ping_pong: **Bot message ping:** \`${Date.now() - start}ms\`
            `;
        } else if (lang === 'tr') {
            pingMessage = `
                :ping_pong: **Bot gecikmesi:** \`${Math.round(client.ws.ping)}ms\`
                :ping_pong: **Bot mesaj gecikmesi:** \`${Date.now() - start}ms\`
            `;
    
        } else {

            pingMessage = `
            :ping_pong: **Bot ping:** \`${Math.round(client.ws.ping)}ms\`
            :ping_pong: **Bot message ping:** \`${Date.now() - start}ms\`
        `;

        }

        let ping = new EmbedBuilder()
            .setAuthor({ name: lang === 'en' ? "My Ping" : "Gecikmem", iconURL: client.user.avatarURL() })
            .setColor("Random")
            .setDescription(pingMessage)
            .setTimestamp()
            .setFooter({ text: `${interaction.user.username} ${lang === 'en' ? 'Requested by' : 'tarafından istendi'}`, iconURL: interaction.user.avatarURL() });
            await interaction.deferReply()
        interaction.editReply({ embeds: [ping] });
    }
};
