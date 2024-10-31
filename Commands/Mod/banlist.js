const { ApplicationCommandType, PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { JsonProvider } = require("ervel.db");
const db = new JsonProvider("./DataBase/lang.json", ".");

async function getServerLanguage(guildId) {
    const lang = await db.fetch(`lang_${guildId}`);
    return lang || 'en'; 
}

module.exports = {
    name: 'banlist',
    description: "Display the list of banned users.",
    type: ApplicationCommandType.ChatInput,
    cooldown: 3000,
  

    run: async (client, interaction) => {
        const guildId = interaction.guild.id;
        const lang = await getServerLanguage(guildId);
        const staff = lang === "en"
        ? `<:unsuces_option:1182742290020708364> You must have the \`BanMembers\` permission to use this command.`
        : `<:unsuces_option:1182742290020708364> Bu komutu kullanmak için \`Banlama\` iznine sahip olmanız gerekir.`;

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
        return interaction.reply({ content: `> ${staff}`, ephemeral: true });
    }
        const bannedUsers = await interaction.guild.bans.fetch();
        const banArray = Array.from(bannedUsers.values());

        var noBansMessage = lang === "en" 
            ? `> <:unsuces_option:1182742290020708364> No users are banned in this server.` 
            : `> <:unsuces_option:1182742290020708364> Bu sunucuda yasaklanmış kullanıcı yok.`;

        if (banArray.length === 0) {
            return interaction.reply({ content: noBansMessage, ephemeral: true });
        }

        const pageSize = 10;
        let currentPage = 0;
        const totalPages = Math.ceil(banArray.length / pageSize);

        const generateEmbed = (page) => {
            const start = page * pageSize;
            const end = start + pageSize;
            const currentBans = banArray.slice(start, end);

            const embed = new EmbedBuilder()
                .setAuthor({
                    name: lang === "en" 
                        ? `Server Banned Users - Page ${page + 1}/${totalPages}` 
                        : `Sunucu Yasaklı Kullanıcılar - Sayfa ${page + 1}/${totalPages}`, 
                    iconURL: client.user.avatarURL({ dynamic: true })
                })
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                .setColor('Red')
                .setTimestamp();

            currentBans.forEach((ban, index) => {
                const userField = lang === "en" 
                    ? `ID: \`${ban.user.id}\`\nReason: \`${ban.reason || 'No reason provided'}\``
                    : `ID: \`${ban.user.id}\`\nSebep: \`${ban.reason || 'Sebep belirtilmemiş'}\``;
                embed.addFields({ 
                    name: `${index + 1 + start}.  ${ban.user.tag}`, 
                    value: userField 
                });
            });

            return embed;
        };

        const generateButtons = (page) => {
            return new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('previous')
                        .setLabel(lang === "en" ? 'Previous' : 'Önceki')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page === 0),
                    new ButtonBuilder()
                        .setCustomId('next')
                        .setLabel(lang === "en" ? 'Next' : 'Sonraki')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page === totalPages - 1)
                );
        };

        const message = await interaction.reply({
            embeds: [generateEmbed(currentPage)],
            components: [generateButtons(currentPage)],
            fetchReply: true
        });

        const filter = i => i.user.id === interaction.user.id;
        const collector = message.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async i => {
            if (i.customId === 'previous') {
                currentPage--;
            } else if (i.customId === 'next') {
                currentPage++;
            }

            await i.update({
                embeds: [generateEmbed(currentPage)],
                components: [generateButtons(currentPage)]
            });
        });

        collector.on('end', () => {
            message.edit({
                components: [generateButtons(currentPage).setDisabled(true)]
            });
        });
    }
};
