const { ApplicationCommandType, PermissionsBitField, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const { JsonProvider } = require('ervel.db');
const db = new JsonProvider('./DataBase/lang.json', '.');

async function getServerLanguage(guildId) {
    const lang = await db.fetch(`lang_${guildId}`);
    return lang || 'en';
}

module.exports = {
    name: 'unmute',
    description: 'Unmute a user / Bir kullanıcıyı susturmadan çıkar.',
    type: ApplicationCommandType.ChatInput,
    cooldown: 3000,
    userPerms: [PermissionsBitField.Flags.ModerateMembers],
    options: [
        {
            name: 'user',
            description: 'The user to unmute / Susturulması kaldırılacak kullanıcı',
            type: ApplicationCommandOptionType.User,
            required: true,
        }
    ],

    run: async (client, interaction) => {
        const guildId = interaction.guild.id;
        const lang = await getServerLanguage(guildId);
        const user = interaction.options.getUser('user');
        const member = interaction.guild.members.cache.get(user.id);

        if (!member) {
            return interaction.reply({
                content: `> ${lang === 'en' ? `<:unsuces_option:1182742290020708364> User not found in the guild.` : `<:unsuces_option:1182742290020708364> Kullanıcı sunucuda bulunamadı.`}`,
                ephemeral: true
            });
        }

        if (!member.isCommunicationDisabled()) {
            return interaction.reply({
                content: `> ${lang === 'en' ? `<:unsuces_option:1182742290020708364> User is not muted.` : `<:unsuces_option:1182742290020708364> Kullanıcı susturulmamış.`}`,
                ephemeral: true
            });
        }

        await member.timeout(null);

        const embed = new EmbedBuilder()
            .setColor('Green')
            .setAuthor({
                name: lang === 'en' ? 'User Unmuted' : 'Kullanıcı Susturulması Kaldırıldı',
                iconURL: client.user.avatarURL()
            })
            .setDescription(`${lang === 'en' ? `<:suces_option:1182742232135106691> ${user} has been unmuted.` : `<:suces_option:1182742232135106691> ${user} susturulması kaldırıldı.`}`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

     
    }
};
