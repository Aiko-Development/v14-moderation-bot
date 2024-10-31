const { ApplicationCommandType, PermissionsBitField, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const { JsonProvider } = require("ervel.db");
const db = new JsonProvider("./DataBase/lang.json", ".");

// Sunucu dilini almak için fonksiyon
async function getServerLanguage(guildId) {
    const lang = await db.fetch(`lang_${guildId}`);
    return lang || 'en'; 
}

module.exports = {
    name: 'lock',
    description: "Lock the channel / Kanalı kilitle.",
    type: ApplicationCommandType.ChatInput,
    cooldown: 3000,
    userPerms: [PermissionsBitField.Flags.ManageChannels],

    run: async (client, interaction) => {
        const guildId = interaction.guild.id;
        const lang = await getServerLanguage(guildId);
        const channel = interaction.channel;

        // Kanalı kilitle
        await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
            SendMessages: false,
        });

        const embed = new EmbedBuilder()
            .setColor('Red')
            .setTitle(lang === "en" ? 'Channel Locked' : 'Kanal Kilitlendi')
            .setDescription(lang === "en" 
                ? `<:suces_option:1182742232135106691> This channel is now locked.` 
                : `<:suces_option:1182742232135106691> Bu kanal artık kilitli.`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
