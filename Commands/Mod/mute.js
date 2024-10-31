const { ApplicationCommandType, PermissionsBitField, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const { JsonProvider } = require('ervel.db');
const db = new JsonProvider('./DataBase/lang.json', '.');  // Dil veritabanı
const muteDb = require("orio.db");
const ms = require("ms")

async function getServerLanguage(guildId) {
    const lang = await db.fetch(`lang_${guildId}`);
    return lang || 'en';
}

module.exports = {
    name: 'mute',
    description: 'Mute a user for a specified time / Belirli bir süre için bir kullanıcıyı sustur.',
    type: ApplicationCommandType.ChatInput,
    cooldown: 3000,
    userPerms: [PermissionsBitField.Flags.ModerateMembers],
    options: [
        {
            name: 'user',
            description: 'The user to mute / Susturulacak kullanıcı',
            type: ApplicationCommandOptionType.User,
            required: true,
        },
        {
            name: 'duration',
            description: 'Duration of mute (e.g., 10m, 1h) / Susturma süresi (örn: 10m, 1h)',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: 'reason',
            description: 'The reason for mute / Susturma sebebi',
            type: ApplicationCommandOptionType.String,
            required: false,
        },
    ],

    run: async (client, interaction) => {
        const guildId = interaction.guild.id;
        const lang = await getServerLanguage(guildId);
        const user = interaction.options.getUser('user');
        const duration = interaction.options.getString('duration');
        const reason = interaction.options.getString('reason') || (lang === 'en' ? 'No reason provided' : 'Sebep belirtilmedi');

        const member = interaction.guild.members.cache.get(user.id);
        if (!member) {
            return interaction.reply({
                content: `> ${lang === 'en' ? `<:unsuces_option:1182742290020708364> User not found in the guild.` : `<:unsuces_option:1182742290020708364> Kullanıcı sunucuda bulunamadı.`}`,
                ephemeral: true
            });
        }

        /*if (!member.manageable) {
            return interaction.reply({
                content: `> ${lang === 'en' ? `<:unsuces_option:1182742290020708364> Cannot mute this user.` : `<:unsuces_option:1182742290020708364> Bu kullanıcıyı susturamazsınız.`}`,
                ephemeral: true
            });
        }*/

        // Mute süresini milisaniye olarak hesaplayın
        const time = ms(duration);
        if (!time) {
            return interaction.reply({
                content: `> ${lang === 'en' ? `<:unsuces_option:1182742290020708364> Invalid duration format.` : `<:unsuces_option:1182742290020708364> Geçersiz süre formatı.`}`,
                ephemeral: true
            });
        }

        await member.timeout(time, reason);

        // Mute bilgisini kaydetme
        const muteTime = Math.round(Date.now() / 1000);  // Unix zaman damgası
        const muteData = {
            userId: user.id,
            reason: reason,
            mutedAt: muteTime,
            duration: duration
        };

        await muteDb.set(`mute_${guildId}_${user.id}`, muteData);  // Mute bilgilerini kaydet

        const embed = new EmbedBuilder()
            .setColor('Red')
            .setAuthor({
                name: lang === 'en' ? 'User Muted' : 'Kullanıcı Susturuldu',
                iconURL: client.user.avatarURL()
            })
            .setDescription(
                `${lang === 'en' ? `<:suces_option:1182742232135106691> ${user} has been muted for ${duration}.` : `<:suces_option:1182742232135106691> ${user} ${duration} süreyle susturuldu.`}`
            )
            .addFields({ name: lang === 'en' ? `<a:reason_anju:1122845034572689448> Reason` : `<a:reason_anju:1122845034572689448> Sebep`, value: `\`\`\`${reason}\`\`\`` })
            .addFields({ name: lang === 'en' ? 'Muted At' : 'Susturulma Zamanı', value: `<t:${muteTime}:R>` })  // Unix timestamp olarak kaydedilen zamanı göster
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

     
    }
};
