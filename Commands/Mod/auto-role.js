const {
    ApplicationCommandType,
    PermissionsBitField,
    ActionRowBuilder,
    RoleSelectMenuBuilder,
    ChannelSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} = require('discord.js');
const db = require("orio.db");
const { JsonProvider } = require("ervel.db");
const db1 = new JsonProvider("./DataBase/lang.json", ".");

async function getServerLanguage(guildId) {
    const lang = await db1.fetch(`lang_${guildId}`);
    return lang || 'en';
}

module.exports = {
    name: 'auto-roles-config',
    description: "Configure auto roles and channel for notifications.",
    type: ApplicationCommandType.ChatInput,
    cooldown: 3000,
    run: async (client, interaction) => {
        const guildId = interaction.guild.id;
        const lang = await getServerLanguage(guildId);

        const staff = lang === "en"
            ? `<:unsuces_option:1182742290020708364> You must have the \`Administrator\` permission to use this command.`
            : `<:unsuces_option:1182742290020708364> Bu komutu kullanmak için \`Yönetici\` iznine sahip olmanız gerekir.`;

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: `> ${staff}`, ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setThumbnail(interaction.guild.iconURL({dynamic:true}))
            .setTitle(lang === 'en' ? 'Auto Roles and Notification Channel Configuration' : 'Otomatik Roller ve Bildirim Kanalı Yapılandırması')
            .setDescription(lang === 'en'
                ? 'Select roles for new members and bots, and choose a channel for log. (Setting the Log Channel is Not Necessary.)'
                : 'Yeni üyeler ve botlar için roller seçin, ve günlük kanalı ayarlayın. (Günlük Kanalı Ayarlamak Zorunlu Değildir.)')
            .addFields(
                { name: lang === 'en' ? 'Current User Role' : 'Mevcut Kullanıcı Rolü', value: `<@&${db.get(`autorole_user_${guildId}`) || 'None'}>`, inline: true },
                { name: lang === 'en' ? 'Current Bot Role' : 'Mevcut Bot Rolü', value: `<@&${db.get(`autorole_bot_${guildId}`) || 'None'}>`, inline: true },
                { name: lang === 'en' ? 'Current Log Channel' : 'Mevcut Günlük Kanalı', value: `<#${db.get(`autoRoleChannel_${guildId}`) || 'None'}>`, inline: true }
            )
            .setFooter({ text: lang === 'en' ? 'Configure auto roles and notification channels as needed.' : 'Otomatik rolleri ve bildirim kanallarını gerektiği gibi yapılandırın.' });

        const userRoleSelectMenu = new RoleSelectMenuBuilder()
            .setCustomId('selectUserRole')
            .setPlaceholder(lang === 'en' ? 'Select a role for new members...' : 'Yeni üyeler için bir rol seçin...');

        const botRoleSelectMenu = new RoleSelectMenuBuilder()
            .setCustomId('selectBotRole')
            .setPlaceholder(lang === 'en' ? 'Select a role for bots...' : 'Botlar için bir rol seçin...');

        const channelSelectMenu = new ChannelSelectMenuBuilder()
            .setCustomId('selectNotificationChannel')
            .setPlaceholder(lang === 'en' ? 'Select a channel for log...' : 'Günlük için bir kanal seçin...');

        const saveButton = new ButtonBuilder()
            .setCustomId('saveConfig')
            .setLabel(lang === 'en' ? 'Save Configuration' : 'Yapılandırmayı Kaydet')
            .setStyle(ButtonStyle.Success);

        const resetUserRoleButton = new ButtonBuilder()
            .setCustomId('resetUserRole')
            .setLabel(lang === 'en' ? 'Reset User Role' : 'Kullanıcı Rolünü Sıfırla')
            .setStyle(ButtonStyle.Danger);

        const resetBotRoleButton = new ButtonBuilder()
            .setCustomId('resetBotRole')
            .setLabel(lang === 'en' ? 'Reset Bot Role' : 'Bot Rolünü Sıfırla')
            .setStyle(ButtonStyle.Danger);

        const resetChannelButton = new ButtonBuilder()
            .setCustomId('resetChannel')
            .setLabel(lang === 'en' ? 'Reset Channel' : 'Kanalı Sıfırla')
            .setStyle(ButtonStyle.Danger);

        const resetAllButton = new ButtonBuilder()
            .setCustomId('resetAll')
            .setLabel(lang === 'en' ? 'Reset All' : 'Hepsini Sıfırla')
            .setStyle(ButtonStyle.Danger);

        const userRoleRow = new ActionRowBuilder().addComponents(userRoleSelectMenu);
        const botRoleRow = new ActionRowBuilder().addComponents(botRoleSelectMenu);
        const channelRow = new ActionRowBuilder().addComponents(channelSelectMenu);
        const buttonRow1 = new ActionRowBuilder().addComponents(saveButton);
        const buttonRow2 = new ActionRowBuilder().addComponents(resetUserRoleButton, resetBotRoleButton, resetChannelButton, resetAllButton);

        await interaction.reply({
            embeds: [embed],
            components: [userRoleRow, botRoleRow, channelRow, buttonRow1, buttonRow2],
            ephemeral: true
        });

        client.on('interactionCreate', async interaction => {
            const guildId = interaction.guild.id;
            const lang = await getServerLanguage(guildId);

            if (interaction.isRoleSelectMenu()) {
                const selectedRole = interaction.values[0];
                const response = interaction.customId === 'selectUserRole'
                    ? (lang === "en" ? `User role set to <@&${selectedRole}>` : `Kullanıcı rolü <@&${selectedRole}> olarak ayarlandı`)
                    : (lang === "en" ? `Bot role set to <@&${selectedRole}>` : `Bot rolü <@&${selectedRole}> olarak ayarlandı`);

                if (interaction.customId === 'selectUserRole') {
                    db.set(`autorole_user_${guildId}`, selectedRole);
                } else if (interaction.customId === 'selectBotRole') {
                    db.set(`autorole_bot_${guildId}`, selectedRole);
                }

                await interaction.reply({ content: response, ephemeral: true });
            } else if (interaction.isChannelSelectMenu() && interaction.customId === 'selectNotificationChannel') {
                const selectedChannel = interaction.values[0];
                const kanal = lang === "en" ? `Log channel set to <#${selectedChannel}>` : `Günlük kanalı <#${selectedChannel}> olarak ayarlandı`;
                db.set(`autoRoleChannel_${guildId}`, selectedChannel);
                await interaction.reply({ content: kanal, ephemeral: true });
            } else if (interaction.isButton()) {
                let message;
                switch (interaction.customId) {
                    case 'saveConfig':
                        const selectedUserRole = db.get(`autorole_user_${guildId}`);
                        const selectedBotRole = db.get(`autorole_bot_${guildId}`);
                        const selectedChannel = db.get(`autoRoleChannel_${guildId}`);
                        message = lang === "en"
                            ? `<:suces_option:1182742232135106691> **The auto-assigned roles and notification channel have been saved. User Role: <@&${selectedUserRole}>, Bot Role: <@&${selectedBotRole}>, Notification Channel: <#${selectedChannel}>.**`
                            : `<:suces_option:1182742232135106691> **Otomatik atanmış roller ve bildirim kanalı kaydedildi. Kullanıcı Rolü: <@&${selectedUserRole}>, Bot Rolü: <@&${selectedBotRole}>, Bildirim Kanalı: <#${selectedChannel}>.**`;
                        break;
                    case 'resetUserRole':
                        db.delete(`autorole_user_${guildId}`);
                        message = lang === 'en' ? 'User role has been reset.' : 'Kullanıcı rolü sıfırlandı.';
                        break;
                    case 'resetBotRole':
                        db.delete(`autorole_bot_${guildId}`);
                        message = lang === 'en' ? 'Bot role has been reset.' : 'Bot rolü sıfırlandı.';
                        break;
                    case 'resetChannel':
                        db.delete(`autoRoleChannel_${guildId}`);
                        message = lang === 'en' ? 'Notification channel has been reset.' : 'Bildirim kanalı sıfırlandı.';
                        break;
                    case 'resetAll':
                        db.delete(`autorole_user_${guildId}`);
                        db.delete(`autorole_bot_${guildId}`);
                        db.delete(`autoRoleChannel_${guildId}`);
                        message = lang === 'en' ? 'All configurations have been reset.' : 'Tüm yapılandırmalar sıfırlandı.';
                        break;
                }
                await interaction.reply({ content: message, ephemeral: true });
            }
        });
    },
};
