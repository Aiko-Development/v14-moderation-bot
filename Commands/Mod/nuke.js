const { ApplicationCommandType, PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { JsonProvider } = require("ervel.db");
const db = new JsonProvider("./DataBase/lang.json", ".");

async function getServerLanguage(guildId) {
    const lang = await db.fetch(`lang_${guildId}`);
    return lang || 'en'; 
}

module.exports = {
    name: 'nuke',
    description: "Nuke the current channel.",
    type: ApplicationCommandType.ChatInput,
    cooldown: 3000,
  

    run: async (client, interaction) => {
        const guildId = interaction.guild.id;
        const lang = await getServerLanguage(guildId);
        const staff = lang === "en"
        ? `<:unsuces_option:1182742290020708364> You must have the \`Manage Channels\` permission to use this command.`
        : `<:unsuces_option:1182742290020708364> Bu komutu kullanmak için \`Kanalları Yönet\` iznine sahip olmanız gerekir.`;

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        return interaction.reply({ content: `> ${staff}`, ephemeral: true });
    }


    interaction.channel.clone().then(newChannel => {
        newChannel.send({
            embeds: [
                new EmbedBuilder()
                    .setAuthor({ name: lang === "en " ? `${interaction.user.username} Channel Reset`: ` ${interaction.user.username} Tarafından Kanal Sıfırlandı`, iconURL: interaction.user.avatarURL({ dynamic: true }) })
                    .setDescription(lang === "en" ? "<:suces_option:1182742232135106691> **Channel successfully reset.** (\`" + interaction.user.username + "\`)": "<:suces_option:1182742232135106691> Kanal başarılı bir şekilde sıfırlandı (\`" + interaction.user.username + "\`)")
                    .setColor("Random")
                    .setTimestamp()
            ]
        });
    });
    interaction.channel.delete();

    
    }
};
