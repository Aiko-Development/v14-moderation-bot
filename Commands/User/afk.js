const { ApplicationCommandType, EmbedBuilder } = require('discord.js');
const { JsonProvider } = require("ervel.db");
const db = new JsonProvider("./Database/afkdata.json", ".");
const langDb = new JsonProvider("./DataBase/lang.json", ".");

// Sunucu dilini almak için fonksiyon
async function getServerLanguage(guildId) {
    const lang = await langDb.fetch(`lang_${guildId}`);
    return lang || 'en';
}

module.exports = {
    name: 'afk',
    description: "You activate AFK mode / AFK modunu aktif edersiniz",
    type: ApplicationCommandType.ChatInput,
    cooldown: 3000,
    options: [
        {
            name: 'reason',
            description: 'You write a reason for AFK / AFK sebebinizi yazın',
            type: 3,
            required: false
        }
    ],

    run: async (client, interaction) => {
        const guildId = interaction.guild.id;
        const lang = await getServerLanguage(guildId);

        const reason = interaction.options.getString("reason") || (lang === "en" ? "This User Has No Reason Specified!" : "Bu kullanıcı sebep belirtmedi!");

        if (interaction.member.displayName.startsWith("[AFK]")) {
            return interaction.reply({ content: lang === "en" ? "You are already in AFK mode!" : "Zaten AFK modundasınız!", ephemeral: true });
        }

        let user = interaction.guild.members.cache.get(interaction.user.id);
        let originalNickname = user.displayName;

        db.set(`sebep_${interaction.user.id}_${interaction.guild.id}`, reason);
        db.set(`user_${interaction.user.id}_${interaction.guild.id}`, interaction.user.id);
        db.set(`afktime_${interaction.guild.id}`, Date.now());
        db.set(`nick_${interaction.user.id}_${interaction.guild.id}`, originalNickname);

        let afkReason = db.fetch(`sebep_${interaction.user.id}_${interaction.guild.id}`);

        // Kullanıcı adını [AFK] olarak güncelle
        interaction.member.setNickname(`[AFK] ` + originalNickname).catch(err => {
            console.log("Error: Missing Permissions");
        });

        const afkEmbed = new EmbedBuilder()
            .setColor("Green")
            .setAuthor({ name: "AFK", iconURL: client.user.avatarURL() })
            .setThumbnail(interaction.user.avatarURL({ dynamic: true }))
            .setDescription(lang === "en"
                ? `<a:afk:1028539927664799805> **${interaction.user} They have successfully logged in with the reason \`${afkReason}\` in AFK mode.**`
                : `<a:afk:1028539927664799805> **${interaction.user} Başarıyla AFK moduna \`${afkReason}\` sebebiyle giriş yaptı.**`)
            .setFooter({ text: lang === "en" ? "AFK Mode" : "AFK Modu", iconURL: client.user.avatarURL() })
            .setTimestamp();

        // Yanıtla ve mesajı 3 saniye sonra sil
        interaction.reply({ embeds: [afkEmbed] }).then(msg => {
            setTimeout(() => { msg.delete() }, 3000);
        });
    }
};
