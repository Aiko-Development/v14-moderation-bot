const { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const { JsonProvider } = require("ervel.db");
const db = new JsonProvider("./DataBase/lang.json", ".");

async function getServerLanguage(guildId) {
    const lang = await db.fetch(`lang_${guildId}`);
    return lang || 'en';
}

module.exports = {
    name: 'emojis',
    description: "Lists all emojis on the server.",
    type: ApplicationCommandType.ChatInput,
    cooldown: 3000,
    run: async (client, interaction) => {
        const guildId = interaction.guild.id;
        const lang = await getServerLanguage(guildId);

        const emojisNormal = interaction.guild.emojis.cache.filter(emoji => !emoji.animated);
        const emojisAnimated = interaction.guild.emojis.cache.filter(emoji => emoji.animated);

        const noEmojisText = lang === 'en' ? '- There Are No Emojis on This Server!' : '- Bu Sunucuda Hiç Emoji Yok!';
        const considerAddingText = lang === 'en' ? '- You might consider adding some emojis.' : '- Birkaç emoji eklemeyi düşünebilirsiniz.';
        const emojiQuantitiesText = lang === 'en' ? '- Emoji Quantities' : '- Emoji Miktarları';
        const stillEmojisText = lang === 'en' ? 'Still Emojis' : 'Hareketsiz Emojiler';
        const animatedEmojisText = lang === 'en' ? 'Animated Emojis' : 'Hareketli Emojiler';
        const noIdleEmojisText = lang === 'en' ? '- There are no idle emojis on this server.' : '- Bu sunucuda hareketsiz emoji yok.';
        const noAnimatedEmojisText = lang === 'en' ? '- There are no animated emojis on this server.' : '- Bu sunucuda hareketli emoji yok.';
        const totalEmojisText = lang === 'en' ? 'Total on this server' : 'Bu sunucuda toplam';
        const emojisText = lang === 'en' ? 'emojis' : 'emoji var.';
        const homePageText = lang === 'en' ? 'Home page' : 'Ana Sayfa';

        if (!emojisNormal.size && !emojisAnimated.size) {
            return await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(noEmojisText)
                        .setDescription(considerAddingText)
                ]
            });
        }

        const embed = new EmbedBuilder()
            .setAuthor({ name: `${client.user.username} - Emojis` })
            .setTitle(`- ${totalEmojisText} ${emojisNormal.size + emojisAnimated.size} ${emojisText}`)
            .addFields([
                {
                    name: emojiQuantitiesText,
                    value: `> ${stillEmojisText}: \`${emojisNormal.size}\`\n> ${animatedEmojisText}: \`${emojisAnimated.size}\``,
                }
            ])
            .setDescription('> ' + (lang === 'en' ? 'You can use the buttons below to view emojis.' : 'Aşağıdaki butonları kullanarak emojileri görebilirsiniz.'));

        let mainPageButton = new ButtonBuilder().setLabel(homePageText).setCustomId("mainPageButton").setStyle('Primary').setDisabled(true);
        let emojisPageButton = new ButtonBuilder().setLabel(stillEmojisText).setCustomId("emojisPageButton").setStyle('Primary');
        let animatedPageButton = new ButtonBuilder().setLabel(animatedEmojisText).setCustomId("animatedPageButton").setStyle('Primary');

        const reply = await interaction.reply({
            embeds: [embed],
            components: [new ActionRowBuilder().addComponents(mainPageButton, emojisPageButton, animatedPageButton)]
        });

        const replyMessage = interaction.type === 2 && await interaction.fetchReply();
        const filter = i => i.message.id === (interaction.type === 2 ? replyMessage : reply).id && i.user.id === (interaction.type === 2 ? interaction.user : interaction.author).id;

        const collector = reply.createMessageComponentCollector({ filter, time: 600000 });

        collector.on('collect', async btn => {
            if (btn.customId === "mainPageButton") {
                mainPageButton.setDisabled(true);
                emojisPageButton.setDisabled(false);
                animatedPageButton.setDisabled(false);

                await interaction.editReply({ embeds: [embed], components: [new ActionRowBuilder().addComponents(mainPageButton, emojisPageButton, animatedPageButton)] });

            } else if (btn.customId === "emojisPageButton") {
                mainPageButton.setDisabled(false);
                emojisPageButton.setDisabled(true);
                animatedPageButton.setDisabled(false);

                if (!emojisNormal.size) {
                    return await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setAuthor({ name: `${client.user.username} - Emojis` })
                                .setDescription(noIdleEmojisText)
                        ],
                        components: [new ActionRowBuilder().addComponents(mainPageButton, emojisPageButton, animatedPageButton)]
                    });
                }

                const emojisNormalString = emojisNormal.map(emoji => emoji.toString()).join(' ');
                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setAuthor({ name: `${client.user.username} - Emojis` })
                            .setTitle(`- ${stillEmojisText} (**${emojisNormal.size}**)`)
                            .setDescription(emojisNormalString)
                    ],
                    components: [new ActionRowBuilder().addComponents(mainPageButton, emojisPageButton, animatedPageButton)]
                });

            } else if (btn.customId === "animatedPageButton") {
                mainPageButton.setDisabled(false);
                emojisPageButton.setDisabled(false);
                animatedPageButton.setDisabled(true);

                if (!emojisAnimated.size) {
                    return await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setAuthor({ name: `${client.user.username} - Emojis` })
                                .setDescription(noAnimatedEmojisText)
                        ],
                        components: [new ActionRowBuilder().addComponents(mainPageButton, emojisPageButton, animatedPageButton)]
                    });
                }

                const emojisAnimatedString = emojisAnimated.map(emoji => emoji.toString()).join(' ');
                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setAuthor({ name: `${client.user.username} - Emojis` })
                            .setTitle(`**»** ${animatedEmojisText} (**${emojisAnimated.size}**)`)
                            .setDescription(emojisAnimatedString)
                    ],
                    components: [new ActionRowBuilder().addComponents(mainPageButton, emojisPageButton, animatedPageButton)]
                });
            }
        });

        collector.on('end', async collected => {
            const disabledButtons = [mainPageButton.setDisabled(true), emojisPageButton.setDisabled(true), animatedPageButton.setDisabled(true)];
            await interaction.editReply({ components: [new ActionRowBuilder().addComponents(...disabledButtons)] }).catch(() => {});
        });
    }
};
