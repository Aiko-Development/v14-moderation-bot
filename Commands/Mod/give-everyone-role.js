const {
    ApplicationCommandType,
    PermissionsBitField,
    ApplicationCommandOptionType,
    ButtonBuilder,
    ActionRowBuilder,
    EmbedBuilder
} = require('discord.js');
//const dbl = require('dblapi.js');
const { JsonProvider } = require("ervel.db");
const db = new JsonProvider("./DataBase/lang.json", ".");

async function getServerLanguage(guildId) {
    const lang = await db.fetch(`lang_${guildId}`);
    return lang || 'en';
}

module.exports = {
    name: 'give-role-everyone',
    description: "Give everyone a role.",
    type: ApplicationCommandType.ChatInput,
    cooldown: 3000,
    options: [
        {
            name: 'role',
            description: 'Role for everyone',
            type: ApplicationCommandOptionType.Role,
            required: true
        }
    ],

    run: async (client, interaction) => {
       /* const es = new dbl('', client);*/
        const guildId = interaction.guild.id;
        const lang = await getServerLanguage(guildId);

       /* es.hasVoted(interaction.user.id).then(async (voted) => {
            if (!voted) {
                const message = lang === 'en' ? `> <:unsuces_option:1182742290020708364> **You must vote for the bot to use this command.**\nhttps://top.gg/bot/798621154680111116/vote` : `> <:unsuces_option:1182742290020708364> **Bu komutu kullanmak için bota oy vermelisiniz.**\nhttps://top.gg/bot/798621154680111116/vote`;
                return interaction.reply({ content: message, ephemeral: true });
            }*/

            if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                const message = lang === 'en' ? '> <:unsuces_option:1182742290020708364> You must have the `Administrator` permission to use this command.' : '> <:unsuces_option:1182742290020708364> Bu komutu kullanmak için `Yönetici` yetkisine sahip olmalısınız.';
                return interaction.reply({ content: message, ephemeral: true });
            }

            const role = interaction.options.getRole('role');
            const confirmButton = new ButtonBuilder()
                .setCustomId('confirm_role')
                .setLabel(lang === 'en' ? 'Approve' : 'Onayla')
                .setEmoji('1238197385923137556')
                .setStyle(3);

            const cancelButton = new ButtonBuilder()
                .setCustomId('cancel')
                .setLabel(lang === 'en' ? 'Cancel' : 'İptal')
                .setEmoji('1238197383444299866')
                .setStyle(4);

            const actionRow = new ActionRowBuilder()
                .addComponents(confirmButton, cancelButton);

            const embedMessage = new EmbedBuilder()
                .setColor("Green")
                .setAuthor({ name: `${interaction.user.displayName}, ${lang === 'en' ? 'Are you sure to give everyone a role?' : 'Herkese rol vermek istediğinizden emin misiniz?'}`, iconURL: interaction.user.displayAvatarURL() })
                .setDescription(`${lang === 'en' ? 'The Role You Specify is' : 'Belirttiğiniz Rol'}: <@&${role.id}>. ${lang === 'en' ? 'If you want to give this role to everyone, please click the confirmation button.' : 'Eğer bu rolü herkese vermek istiyorsanız, lütfen onay butonuna tıklayın.'}`)
                .setFooter({ text: `${interaction.user.displayName}`, iconURL: client.user.displayAvatarURL() })
                .setTimestamp();

            const sentMessage = await interaction.reply({ embeds: [embedMessage], components: [actionRow], ephemeral: true });

            const filter = i => i.user.id === interaction.user.id && (i.customId === 'confirm_role' || i.customId === 'cancel');

            const collector = sentMessage.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async i => {
                if (i.customId === 'confirm_role') {
                    await interaction.guild.members.fetch(); // Tüm üyeleri önbelleğe alır
                    const membersWithRole = interaction.guild.members.cache.filter(member => !member.user.bot);
                    const started = new EmbedBuilder()
                    .setAuthor({name:`${lang === "en" ? `Everyone started to be given a role`:`Herkese rol verilmeye başlandı`}`, iconURL: client.user.displayAvatarURL({dynamic:true})})
                    .setDescription(`${lang === 'en' ? 'The role' : 'Rol'} <@&${role.id}> ${lang === 'en' ? 'has been successfully assigned to everyone' : 'herkese başarıyla atandı'} (${membersWithRole.size} ${lang === 'en' ? 'members' : 'üye'})`)
                    .setTimestamp()
                    await interaction.channel.send({embeds:[started]})

                    const updatedEmbed = new EmbedBuilder()
                        .setColor("Green")
                        .setAuthor({ name: `${lang === 'en' ? 'Role assignment process has started' : 'Rol atama işlemi başladı'}`, iconURL: client.user.displayAvatarURL() })
                        .setDescription(`${lang === 'en' ? 'The role' : 'Rol'} <@&${role.id}> ${lang === 'en' ? 'has been successfully assigned to everyone' : 'herkese başarıyla atandı'} (${membersWithRole.size} ${lang === 'en' ? 'members' : 'üye'})`)
                        .setFooter({ text: `${interaction.user.displayName}`, iconURL: client.user.displayAvatarURL() })
                        .setTimestamp();

                    await sentMessage.edit({ embeds: [updatedEmbed], components: [] });
                    

                    await Promise.all(membersWithRole.map(async member => {
                        try {
                            await member.roles.add(role);
                        } catch (error) {
                            console.error(`Error adding role to member ${member.user.tag}:`, error);
                        }
                    }));
                } else if (i.customId === 'cancel') {
                    const cancelledEmbed = new EmbedBuilder()
                        .setColor("Red")
                        .setDescription(lang === 'en' ? 'The role assignment process has been cancelled.' : 'Rol atama işlemi iptal edildi.');
                    await sentMessage.edit({ embeds: [cancelledEmbed], components: [] });
                }
                i.deferUpdate();
                collector.stop();
            });

            collector.on('end', () => {
                actionRow.components.forEach(c => c.setDisabled(true));
                sentMessage.edit({ components: [actionRow] });
            });
        }
    }

