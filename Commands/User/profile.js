const { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { JsonProvider } = require("ervel.db");

const db = new JsonProvider("./DataBase/lang.json", ".");
const mutedb = require("orio.db",)



async function getServerLanguage(guildId) {
    const lang = await db.fetch(`lang_${guildId}`);
    return lang || 'en'; 
}

module.exports = {
    name: 'profile',
    description: "Display a user's profile with additional information.",
    type: ApplicationCommandType.ChatInput,
    cooldown: 3000,
    options: [
        {
            type: ApplicationCommandOptionType.User,
            name: 'user',
            description: 'Choose a user to view their profile.',
            required: false,
        }
    ],

    run: async (client, interaction) => {
        const guildId = interaction.guild.id;
        const member = interaction.options.getMember('user') || interaction.member;
        const lang = await getServerLanguage(guildId);

     
        const mutes = mutedb.get(`mute_${interaction.guild.id}_${member.id}`);
        
        const muteMessage = mutes 
            ? {
                reason: lang === "en" ? `<a:reason_anju:1122845034572689448> Mute reason: \`${mutes.reason}\`` : `<a:reason_anju:1122845034572689448> Susturulma sebebi: \`${mutes.muteData.reason}\``,
                time: lang === "en" ? `<:time:1116459045876932669> Mute duration: <t:${Math.floor(mutes.mutedAt)}>(<t:${Math.floor(mutes.mutedAt)}:R>)` : `<:time:1116459045876932669> Susturulma süresi: <t:${Math.floor(mutes.muteData.duration / 1000)}:R>`
            }
            : {
                reason: lang === "en" ? `❗ This user has not been muted on this server.` : `❗ Bu kullanıcı bu sunucuda mute yememiş.`,
                time: ''
            };


        const userAvatar = member.user.displayAvatarURL({ dynamic: true, size: 128 });
        const userBanner = await client.users.fetch(member.id, { force: true })
            .then(user => user.bannerURL({ dynamic: true, size: 1024 }))
            .catch(() => null);

    
        // Kullanıcı bilgilerini gösteren embed oluştur
        const profileEmbed = new EmbedBuilder()
.setColor('#00FF00')
.setAuthor({ name: `${member.user.tag}'s Profile`, iconURL: userAvatar })
.setThumbnail(userAvatar)
.addFields(
    { name: lang === "en" ? 'Username' : 'Kullanıcı Adı', value: `${member.user.tag}`, inline: true },
    { name: lang === "en" ? 'ID' : 'Kimlik', value: `${member.user.id}`, inline: true },
    { name: lang === "en" ? 'Joined Server' : 'Sunucuya Katılma', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
    { name: lang === "en" ? 'Account Created' : 'Hesap Oluşturma', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true },
    { name: lang === "en" ? '  Mute Info' : 'Susturma Bilgisi', value: `${muteMessage.reason} ${muteMessage.time}`, inline: false }
)
.setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
.setTimestamp();

        
        const avatarEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle(lang === "en" ? 'User Avatar' : 'Kullanıcı Avatarı')
            .setImage(userAvatar)
            .setTimestamp()

        const bannerEmbed = userBanner ? new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle(lang === "en" ? 'User Banner' : 'Kullanıcı Bannerı')
            .setTimestamp()
            .setImage(userBanner)
            : null;

       
        const actionRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('view_avatar')
                    .setLabel(lang === "en" ? 'View Avatar' : 'Avatarı Görüntüle')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(!userAvatar), // Avatar yoksa düğme devre dışı bırakılır.
                new ButtonBuilder()
                    .setCustomId('view_banner')
                    .setLabel(lang === "en" ? 'View Banner' : 'Bannerı Görüntüle')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(!userBanner), // Banner yoksa düğme devre dışı bırakılır.
                new ButtonBuilder()
                    .setCustomId('kick_user')
                    .setLabel(lang === "en" ? 'Kick User' : 'Kullanıcıyı At')
                    .setStyle(ButtonStyle.Danger)
                    .setDisabled(
                        interaction.user.id === member.id || // Kullanıcı kendisini atamaz.
                        member.id === interaction.guild.ownerId || // Sunucu sahibi atılamaz.
                        !interaction.member.permissions.has('KickMembers') || // Kullanıcının kick yetkisi yoksa.
                        interaction.member.roles.highest.position <= member.roles.highest.position // Kullanıcının yetkisi hedef kullanıcınınkinden düşükse.
                    ),
                new ButtonBuilder()
                    .setCustomId('ban_user')
                    .setLabel(lang === "en" ? 'Ban User' : 'Kullanıcıyı Yasakla')
                    .setStyle(ButtonStyle.Danger)
                    .setDisabled(
                        interaction.user.id === member.id || // Kullanıcı kendisini yasaklayamaz.
                        member.id === interaction.guild.ownerId || // Sunucu sahibi yasaklanamaz.
                        !interaction.member.permissions.has('BanMembers') || // Kullanıcının ban yetkisi yoksa.
                        interaction.member.roles.highest.position <= member.roles.highest.position // Kullanıcının yetkisi hedef kullanıcınınkinden düşükse.
                    )
            );

       
        const message = await interaction.reply({ embeds: [profileEmbed], components: [actionRow], fetchReply: true });

        
        const filter = (i) => i.user.id === interaction.user.id;
        const collector = message.createMessageComponentCollector({ filter, componentType: ComponentType.Button, time: 60000 });

        collector.on('collect', async (i) => {
            if (i.customId === 'view_avatar') {
                await i.reply({ embeds: [avatarEmbed], ephemeral: true });
            } else if (i.customId === 'view_banner' && bannerEmbed) {
                await i.reply({ embeds: [bannerEmbed], ephemeral: true });
            } else if (i.customId === 'kick_user') {
                if (member.id === interaction.guild.ownerId) {
                    await i.reply({ content: lang === "en" ? 'You cannot kick the server owner.' : 'Sunucu sahibini atamazsınız.', ephemeral: true });
                } else {
                    await interaction.guild.members.kick(member);
                    await i.reply({ content: lang === "en" ? 'User has been kicked.' : 'Kullanıcı atıldı.', ephemeral: true });
                }
            } else if (i.customId === 'ban_user') {
                if (member.id === interaction.guild.ownerId) {
                    await i.reply({ content: lang === "en" ? 'You cannot ban the server owner.' : 'Sunucu sahibini yasaklayamazsınız.', ephemeral: true });
                } else {
                    await interaction.guild.members.ban(member);
                    await i.reply({ content: lang === "en" ? 'User has been banned.' : 'Kullanıcı yasaklandı.', ephemeral: true });
                }
            }
        });

        collector.on('end', () => {
            
            const disabledRow = new ActionRowBuilder()
                .addComponents(actionRow.components.map(button => button.setDisabled(true)));
            interaction.editReply({ components: [disabledRow] });
        });
    }
};
