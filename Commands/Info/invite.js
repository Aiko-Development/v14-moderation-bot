const { ApplicationCommandType, EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const {JsonProvider} = require("ervel.db")
const db = new JsonProvider("./DataBase/lang.json")
const { BOTSUPPORT, BOTINVITE } = require('../../Bot/set/links');
async function getServerLanguage(guildId) {
    const lang = await db.fetch(`lang_${guildId}`);
    return lang || 'en'; 
}

module.exports = {
    name: 'invite',
    description: "My invite and support link.",
    type: ApplicationCommandType.ChatInput,
    cooldown: 3000,
    run: async (client, interaction) => {
        const guildId = interaction.guild.id;
        const lang = await getServerLanguage(guildId);

        let inviteMessage = '';
        if (lang === 'en') {
            inviteMessage = `<:selam_furki4:1028018399802048718>  **Hi bro, I think you asked for my invite link, here is my link for you to invite me to your server.** \n\n -[Invite Link](${BOTINVITE}), [Support Server](${BOTSUPPORT}), [Vote Link](https://top.gg/bot/${client.user.id}/vote)`;
        } else if (lang === 'tr') {
            inviteMessage = `<:selam_furki4:1028018399802048718>  **Merhaba kanka, sanırım davet linkimi istedin, işte beni sunucuna davet etmek için linkim.** \n\n -[Davet Linki](${BOTINVITE}), [Destek Sunucusu](${BOTSUPPORT}), [Oy Linki](https://top.gg/bot/${client.user.id}/vote)`;
        } else {
            inviteMessage = `<:selam_furki4:1028018399802048718>  **Hi bro, I think you asked for my invite link, here is my link for you to invite me to your server.** \n\n -[Invite Link](${BOTINVITE}), [Support Server](${BOTSUPPORT}), [Vote Link](https://top.gg/bot/${client.user.id}/vote)`;
        }

        let inviteButton = new ButtonBuilder()
            .setStyle(5)
            .setLabel(lang === 'en' ? 'Invite' : 'Davet')
            .setURL(BOTINVITE)
            .setEmoji('📩');
        
        let supportButton = new ButtonBuilder()
            .setStyle(5)
            .setLabel(lang === 'en' ? 'Support' : 'Destek')
            .setURL(BOTSUPPORT)
            .setEmoji('📩');

        let row = new ActionRowBuilder()
            .addComponents(inviteButton, supportButton);

        let inviteEmbed = new EmbedBuilder()
            .setColor('Random')
            .setAuthor({ name: lang === 'en' ? "Invite Link" : "Davet Linki", iconURL: client.user.avatarURL(), url: BOTINVITE })
            .setThumbnail(client.user.avatarURL({ dynamic: true }))
            .setDescription(inviteMessage);
await interaction.deferReply()
        await interaction.editReply({ embeds: [inviteEmbed], components: [row] });
    }
};
