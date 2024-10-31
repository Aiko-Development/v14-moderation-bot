const { ApplicationCommandType, PermissionsBitField, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const { JsonProvider } = require("ervel.db");
const db = new JsonProvider("./DataBase/lang.json", ".");


async function getServerLanguage(guildId) {
    const lang = await db.fetch(`lang_${guildId}`);
    return lang || 'en'; 
}

module.exports = {
    name: 'slowmode',
    description: "Set slowmode in the channel / Kanal için yavaş mod ayarla.",
    type: ApplicationCommandType.ChatInput,
    cooldown: 3000,
    userPerms: [PermissionsBitField.Flags.ManageChannels],
    options: [
        {
            name: 'seconds',
            description: 'The slowmode duration in seconds / Yavaş mod süresi (saniye)',
            type: ApplicationCommandOptionType.Integer,
            required: true,
        },
    ],

    run: async (client, interaction) => {
        const guildId = interaction.guild.id;
        const lang = await getServerLanguage(guildId);
        const seconds = interaction.options.getInteger('seconds');
        const channel = interaction.channel;

        if (seconds < 0 || seconds > 21600) {
            return interaction.reply({
                content: lang === "en"
                    ? "❌ The slowmode duration must be between 0 and 21600 seconds (6 hours)."
                    : "❌ Yavaş mod süresi 0 ile 21600 saniye (6 saat) arasında olmalıdır.",
                ephemeral: true,
            });
        }

     
        await channel.setRateLimitPerUser(seconds);

        const embed = new EmbedBuilder()
            .setColor(seconds === 0 ? 'Green' : 'Yellow')
            .setTitle(lang === "en" ? 'Slowmode Updated' : 'Yavaş Mod Güncellendi')
            .setDescription(
                lang === "en"
                    ? seconds === 0
                        ? "✅ Slowmode has been disabled."
                        : `✅ Slowmode has been set to \`${seconds}\` seconds.`
                    : seconds === 0
                        ? "✅ Yavaş mod devre dışı bırakıldı."
                        : `✅ Yavaş mod \`${seconds}\` saniye olarak ayarlandı.`
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
