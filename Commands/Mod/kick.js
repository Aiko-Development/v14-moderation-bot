const { ApplicationCommandType, PermissionsBitField, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const { JsonProvider } = require("ervel.db");
const db = new JsonProvider("./DataBase/lang.json", ".");

// Sunucu dilini almak için fonksiyon
async function getServerLanguage(guildId) {
    const lang = await db.fetch(`lang_${guildId}`);
    return lang || 'en'; 
}

module.exports = {
    name: 'kick',
    description: "Kick a user / Bir kullanıcıyı at.",
    type: ApplicationCommandType.ChatInput,
    cooldown: 3000,
    userPerms: [PermissionsBitField.Flags.KickMembers],
    options: [
        {
            name: 'user',
            description: 'The user to kick / Atılacak kullanıcı',
            type: ApplicationCommandOptionType.User,
            required: true,
        },
        {
            name: 'reason',
            description: 'The reason for the kick / Atılma sebebi',
            type: ApplicationCommandOptionType.String,
            required: false,
        },
    ],

    run: async (client, interaction) => {
        const guildId = interaction.guild.id;
        const lang = await getServerLanguage(guildId);
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || (lang === "en" ? 'No reason provided' : 'Sebep belirtilmedi');

        const member = interaction.guild.members.cache.get(user.id);
        if (!member) {
            return interaction.reply({ content: `> ${lang === "en" ? `<:unsuces_option:1182742290020708364> User not found in the guild.` : `<:unsuces_option:1182742290020708364> Kullanıcı sunucuda bulunamadı.`}`, ephemeral: true });
        }

        if (member.id === interaction.guild.ownerId) {
            return interaction.reply({ content: `> ${lang === "en" ? `<:unsuces_option:1182742290020708364> You cannot kick the server owner.` : `<:unsuces_option:1182742290020708364> Sunucu sahibini atamazsınız.`}`, ephemeral: true });
        }

        if (member.roles.highest.position >= interaction.member.roles.highest.position) {
            return interaction.reply({ content: `> ${lang === "en" ? `<:unsuces_option:1182742290020708364> You cannot kick a user with an equal or higher role.` : `<:unsuces_option:1182742290020708364> Eşit veya daha yüksek bir role sahip kullanıcıyı atamazsınız.`}`, ephemeral: true });
        }

        await member.kick(reason);

        const embed = new EmbedBuilder()
            .setColor('Red')
            .setAuthor({ name: lang === "en" ? 'User Kicked' : 'Kullanıcı Atıldı', iconURL: client.user.avatarURL() })
            .setDescription(`${lang === "en" ? `<:suces_option:1182742232135106691> ${user} has been kicked.` : `<:suces_option:1182742232135106691> ${user} atıldı.`}`)
            .addFields({ name: lang === "en" ? `<a:reason_anju:1122845034572689448> Reason` : `<a:reason_anju:1122845034572689448> Sebep`, value: `\`\`\`${reason}\`\`\`` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

        const userEmbed = new EmbedBuilder()
            .setColor('Red')
            .setTitle(lang === "en" ? 'You have been kicked' : 'Sunucudan Atıldınız')
            .setDescription(lang === "en" ? `> <a:uzgunum:1268552204726567006> You have been kicked from **${interaction.guild.name}**.` : `> <a:uzgunum:1268552204726567006> **${interaction.guild.name}** sunucusundan atıldınız.`)
            .addFields({ name: lang === "en" ? `<a:reason_anju:1122845034572689448> Reason` : `<a:reason_anju:1122845034572689448> Sebep`, value: `\`\`\`${reason}\`\`\``})
            .setTimestamp();

        try {
            await user.send({ embeds: [userEmbed] });
        } catch (error) {
            console.error('Could not send DM to the user:', error);
        }
    }
};
