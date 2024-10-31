const { ApplicationCommandType, PermissionsBitField, EmbedBuilder } = require('discord.js');
const { JsonProvider } = require("ervel.db");
const db = new JsonProvider("./DataBase/lang.json", ".");

// Sunucu dilini almak için fonksiyon
async function getServerLanguage(guildId) {
    const lang = await db.fetch(`lang_${guildId}`);
    return lang || 'en'; 
}

module.exports = {
    name: 'unlock',
    description: "Unlock the channel / Kanalı aç.",
    type: ApplicationCommandType.ChatInput,
    cooldown: 3000,
    userPerms: [PermissionsBitField.Flags.ManageChannels],

    run: async (client, interaction) => {
        const guildId = interaction.guild.id;
        const lang = await getServerLanguage(guildId);
        const channel = interaction.channel;

        // Kanalın kilidini aç
        await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
            SendMessages: true,
        });

        const embed = new EmbedBuilder()
            .setColor('Green')
            .setTitle(lang === "en" ? 'Channel Unlocked' : 'Kanal Açıldı')
            .setDescription(lang === "en" 
                ? `<:suces_option:1182742232135106691> This channel is now unlocked.` 
                : `<:suces_option:1182742232135106691> Bu kanal artık açık.`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
