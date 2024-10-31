const { ApplicationCommandType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ApplicationCommandOptionType, StringSelectMenuBuilder } = require('discord.js');
const { JsonProvider } = require("ervel.db");
const db = new JsonProvider("./DataBase/lang.json", ".");

async function getServerLanguage(guildId) {
    const lang = await db.fetch(`lang_${guildId}`);
    return lang || 'en';
}

module.exports = {
    name: 'banner',
    description: "Display user's banner",
    type: ApplicationCommandType.ChatInput,
    cooldown: 3000,
    options: [
        {
            name: 'user',
            description: 'The banner of the user you want to display.',
            type: ApplicationCommandOptionType.User
        }
    ],
    run: async (client, interaction) => {
        const user = interaction.options.get('user')?.user || interaction.user;
        const guildId = interaction.guild.id;
        const lang = await getServerLanguage(guildId);

        const fuser = await user.fetch({ force: true });

        const noBannerText = lang === 'en' ? 'This user has no banner' : 'Bu kullanıcının bannerı yok';
        const accentColorText = lang === 'en' ? 'The accent color is' : 'Vurgulu rengi';
        const selectSizeText = lang === 'en' ? 'Select banner size' : 'Banner boyutunu seç';
        const deleteText = lang === 'en' ? 'Delete' : 'Sil';
        const bannerText = lang === 'en' ? 'Banner' : 'Banner';
        const sizeOptions = lang === 'en' ? [
            { label: "2048", value: "2048", description: "2048x2048" },
            { label: "1024", value: "1024", description: "1024x1024" },
            { label: "512", value: "512", description: "512x512" },
            { label: "256", value: "256", description: "256x256" }
        ] : [
            { label: "2048", value: "2048", description: "2048x2048" },
            { label: "1024", value: "1024", description: "1024x1024" },
            { label: "512", value: "512", description: "512x512" },
            { label: "256", value: "256", description: "256x256" }
        ];

        const accentColor = fuser.hexAccentColor || '#5865F2'; // Varsayılan renk

        let deleteButton = new ButtonBuilder()
            .setStyle(4)
            .setLabel(deleteText)
            .setEmoji("<:deleted:1030921611668361236>")
            .setCustomId("delete");

        let sizeMenu = new StringSelectMenuBuilder()
            .setPlaceholder(selectSizeText)
            .setCustomId("sizeSelect")
            .addOptions(sizeOptions);

        let rowMenu = new ActionRowBuilder().addComponents(sizeMenu);
        let rowButton = new ActionRowBuilder().addComponents(deleteButton);

        if (fuser.banner === null) {
            const messages = user.id === interaction.user.id ? noBannerText : noBannerText;
            var embeds = new EmbedBuilder()
                .setColor(accentColor)
                .setAuthor({ name: `${user.username} ${noBannerText}`, iconURL: user.avatarURL({ dynamic: true }) })
                .setDescription(`<:unsuces_option:1182742290020708364> **${messages}. ${accentColorText}** \`${accentColor}\``)
                .setTimestamp();

            await interaction.reply({ embeds: [embeds], components: [rowButton] }).then(async msg => {
                let filter = (i) => i.user.id === interaction.user.id;
                let collector = msg.createMessageComponentCollector({ filter, time: 60000 });

                collector.on("collect", async (i) => {
                    if (i.customId === "delete") {
                        msg.delete();
                    }
                });
            });
        } else {
            let bannerEmbed = new EmbedBuilder()
                .setAuthor({ name: `${user.username} ${bannerText}`, iconURL: user.avatarURL({ dynamic: true }) })
                .setColor("Random")
                .setImage(`${fuser.bannerURL({ dynamic: true, size: 2048 })}`)
                .setFooter({ text: `${bannerText} Legend` });

            await interaction.reply({ embeds: [bannerEmbed], components: [rowMenu, rowButton] }).then(async msg => {
                let filter = (i) => i.user.id === interaction.user.id;
                let collector = msg.createMessageComponentCollector({ filter, time: 60000 });

                collector.on("collect", async (i) => {
                    if (i.customId === "delete") {
                        msg.delete();
                    }
                    if (i.customId === "sizeSelect") {
                        const size = parseInt(i.values[0]);
                        let updatedEmbed = new EmbedBuilder()
                            .setAuthor({ name: `${user.username} ${bannerText}`, iconURL: user.avatarURL({ dynamic: true }) })
                            .setColor("Random")
                            .setImage(`${fuser.bannerURL({ dynamic: true, size: size })}`)
                            .setFooter({ text: `${bannerText} Legend` });

                        await msg.edit({ embeds: [updatedEmbed], components: [rowMenu, rowButton] });
                        i.deferUpdate();
                    }
                });
            });
        }
    }
};
