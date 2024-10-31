const { ApplicationCommandType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ApplicationCommandOptionType, StringSelectMenuBuilder } = require('discord.js');
const { JsonProvider } = require('ervel.db');
const db = new JsonProvider('./DataBase/lang.json', '.');

// Sunucu dilini almak için fonksiyon
async function getServerLanguage(guildId) {
    const lang = await db.fetch(`lang_${guildId}`);
    return lang || 'en';
}

module.exports = {
    name: 'avatar',
    description: "Display user's avatar / Kullanıcının avatarını göster",
    type: ApplicationCommandType.ChatInput,
    cooldown: 3000,
    options: [
        {
            name: 'user',
            description: 'The avatar of the user you want to display / Görüntülemek istediğiniz kullanıcının avatarı.',
            type: ApplicationCommandOptionType.User
        }
    ],
    run: async (client, interaction) => {
        const user = interaction.options.get('user')?.user || interaction.user;
        const guildId = interaction.guild.id;
        const lang = await getServerLanguage(guildId);

        // Mesajlar
        const messages = {
            en: {
                selectOption: 'Select an option',
                avatar: 'Avatar',
                delete: 'Delete'
            },
            tr: {
                selectOption: 'Bir seçenek seçin',
                avatar: 'Avatar',
                delete: 'Sil'
            }
        };

        const texts = messages[lang];

        const embed = new EmbedBuilder()
            .setAuthor({ name: `${user.username} ${texts.avatar}`, iconURL: user.displayAvatarURL({ dynamic: true, size: 128 }) })
            .setColor('Random')
            .setImage(user.displayAvatarURL({ size: 4096 }))
            .setTimestamp();

        let menu = new StringSelectMenuBuilder()
            .setPlaceholder(texts.selectOption)
            .setCustomId('select')
            .addOptions([
                { label: '1024', value: 'büyük', description: '1024x1024' },
                { label: '256', value: 'orta', description: '256x256' },
                { label: '128', value: 'normal', description: '128x128' },
                { label: '64', value: 'minik', description: '64x64' },
                { label: '32', value: 'küçük', description: '32x32' }
            ]);

        let row2 = new ActionRowBuilder().addComponents(menu);

        const formats = ['png', 'jpg', 'jpeg', 'gif'];
        const components = [];

        formats.forEach(format => {
            let imageOptions = { extension: format, forceStatic: format == 'gif' ? false : true };

            if (user.avatar == null && format !== 'png') return;
            if (!user.avatar.startsWith('a_') && format === 'gif') return;
            components.push(
                new ButtonBuilder()
                    .setLabel(format.toUpperCase())
                    .setStyle('Link')
                    .setEmoji('📷')
                    .setURL(user.displayAvatarURL(imageOptions))
            );
        });

        let button2 = new ButtonBuilder()
            .setStyle(4)
            .setLabel(texts.delete)
            .setEmoji('<:deleted:1030921611668361236>')
            .setCustomId('delete');

        const row = new ActionRowBuilder().addComponents(components, button2);

        return interaction.reply({ embeds: [embed], components: [row2, row] }).then(async msg => {
            let filter = i => i.user.id === interaction.user.id;
            let collector = msg.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async i => {
                if (i.customId === 'delete') {
                    msg.delete();
                }

                if (!i.isStringSelectMenu()) return;

                if (i.customId === 'select') {
                    let size = i.values[0];
                    let sizeMap = {
                        'büyük': 1024,
                        'orta': 256,
                        'normal': 128,
                        'minik': 64,
                        'küçük': 32
                    };
                    let selectedSize = sizeMap[size];

                    let avatarEmbed = new EmbedBuilder()
                        .setAuthor({ name: texts.avatar, iconURL: client.user.avatarURL() })
                        .setColor('Random')
                        .setImage(user.displayAvatarURL({ dynamic: true, size: selectedSize, format: 'png' }));

                    msg.edit({ embeds: [avatarEmbed], components: [row, row2] });
                    i.deferUpdate();
                }
            });
        });
    }
};
