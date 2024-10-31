const { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const { JsonProvider } = require('ervel.db');
const db = new JsonProvider('./DataBase/lang.json', '.');

async function getServerLanguage(guildId) {
    const lang = await db.fetch(`lang_${guildId}`);
    return lang || 'en';
}

module.exports = {
    name: 'addemoji',
    description: "Add an emoji to the server / Sunucuya emoji ekle.",
    type: ApplicationCommandType.ChatInput,
    cooldown: 3000,
    options: [
        {
            name: 'file',
            description: 'Upload an emoji file / Emoji dosyası yükle',
            type: ApplicationCommandOptionType.Attachment,
            required: false
        },
        {
            name: 'url',
            description: 'Add an emoji from a URL / URL üzerinden emoji ekle',
            type: ApplicationCommandOptionType.String,
            required: false
        },
        {
            name: 'name',
            description: 'Name for the emoji / Emoji ismi',
            type: ApplicationCommandOptionType.String,
            required: false
        }
    ],

    run: async (client, interaction) => {
        const { guild, options } = interaction;
        const file = options.getAttachment('file');
        const url = options.getString('url');
        const name = options.getString('name');
        const guildId = interaction.guild.id;
        const lang = await getServerLanguage(guildId);

        // Mesajlar
        const messages = {
            en: {
                missingPermission: '> <:unsuces_option:1182742290020708364> You need the `Manage Emojis and Stickers` permission to use this command.',
                missingInput: '> <:unsuces_option:1182742290020708364> You must provide either a file or a URL to add an emoji.',
                missingName: '> <:unsuces_option:1182742290020708364> You must provide a name for the uploaded emoji.',
                success: (emoji) => `> <:suces_option:1182742232135106691> Successfully added the emoji: ${emoji}`,
                failureFile: '> <:unsuces_option:1182742290020708364> Failed to add the emoji. Make sure the file is a valid image and the server has enough emoji slots.',
                failureURL: '> <:unsuces_option:1182742290020708364> Failed to add the emoji. Ensure the URL is correct and points to a valid image.'
            },
            tr: {
                missingPermission: '> <:unsuces_option:1182742290020708364> Bu komutu kullanmak için `Emojileri ve Çıkartmaları Yönet` iznine sahip olmanız gerekir.',
                missingInput: '> <:unsuces_option:1182742290020708364> Bir emoji eklemek için dosya veya URL sağlamalısınız.',
                missingName: '> <:unsuces_option:1182742290020708364> Yüklenen emoji için bir isim sağlamalısınız.',
                success: (emoji) => `> <:suces_option:1182742232135106691> Başarıyla emoji eklendi: ${emoji}`,
                failureFile: '> <:unsuces_option:1182742290020708364> Emoji eklenemedi. Dosyanın geçerli bir resim olduğundan ve sunucunun yeterli emoji alanı olduğundan emin olun.',
                failureURL: '> <:unsuces_option:1182742290020708364> Emoji eklenemedi. URLnin doğru ve geçerli bir resme işaret ettiğinden emin olun.'
            
        }
    }
        const texts = messages[lang];

        
        if (!interaction.member.permissions.has('ManageEmojisAndStickers')) {
            return interaction.reply({ content: texts.missingPermission, ephemeral: true });
        }

      
        if (!file && !url) {
            return interaction.reply({ content: texts.missingInput, ephemeral: true });
        }

      
        if (file) {
            if (!name) {
                return interaction.reply({ content: texts.missingName, ephemeral: true });
            }

            try {
                const emoji = await guild.emojis.create({ attachment: file.url, name: name });
                return interaction.reply({ content: texts.success(emoji) });
            } catch (error) {
                console.error('Error adding emoji:', error);
                return interaction.reply({ content: texts.failureFile, ephemeral: true });
            }
        }

       
        if (url) {
            try {
                const emojiName = name || url.split('/').pop().split('.')[0];
                const emoji = await guild.emojis.create({ attachment: url, name: emojiName });
                return interaction.reply({ content: texts.success(emoji) });
            } catch (error) {
                console.error('Error adding emoji:', error);
                return interaction.reply({ content: texts.failureURL, ephemeral: true });
            }
        }
    }
};
