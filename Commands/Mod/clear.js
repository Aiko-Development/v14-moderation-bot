const { ApplicationCommandType, PermissionsBitField, ApplicationCommandOptionType } = require('discord.js');
const {JsonProvider} = require("ervel.db")
const db = new JsonProvider("./DataBase/lang.json",".")
async function getServerLanguage(guildId) {
    const lang = await db.fetch(`lang_${guildId}`);
    return lang || 'en'; 
}
module.exports = {
    name: 'clear',
    description: "Clear a number of messages.",
    type: ApplicationCommandType.ChatInput,
    cooldown: 3000,
    userPerms: [PermissionsBitField.Flags.ManageMessages],
    options: [
        {
            name: 'amount',
            description: 'The number of messages to delete',
            type: ApplicationCommandOptionType.Integer,
            required: true,
        },
    ],


    run: async (client, interaction) => {
        const amount = interaction.options.getInteger('amount');
        const guildId = interaction.guild.id;
        const lang = await getServerLanguage(guildId);
        const staff = lang === "en"
        ? `<:unsuces_option:1182742290020708364> You must have the \`ManageMessages\` permission to use this command.`
        : `<:unsuces_option:1182742290020708364> Bu komutu kullanmak için \`Mesajları Yönetme\` iznine sahip olmanız gerekir.`;

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
        return interaction.reply({ content: `> ${staff}`, ephemeral: true });
    }

        var yazi1 =  lang === "en" ? `> <:unsuces_option:1182742290020708364> You can only delete between 1 and 100 messages at a time.` : `> <:unsuces_option:1182742290020708364> Tek seferde yalnızca 1 ile 100 arasında mesajı silebilirsiniz.`
    
        if (amount < 1 || amount > 100) {
            return interaction.reply({content: yazi1, ephemeral:true});
        }

        try {
            const deleted = await interaction.channel.bulkDelete(amount, true);
            var yazi2 = lang === "en" ? `> <:suces_option:1182742232135106691> Successfully deleted \`${deleted.size}\` messages.`:`> <:suces_option:1182742232135106691> \`${deleted.size}\` Mesaj başarıyla silindi.`
            interaction.reply({content: yazi2,ephemeral: true});
        } catch (error) {
            console.error('Error clearing messages:', error);
             var yazi3 = lang === "en" ? `> <:unsuces_option:1182742290020708364> There was an error trying to clear messages in this channel.` : `> <:unsuces_option:1182742290020708364> Bu kanaldaki mesajları temizlemeye çalışırken bir hata oluştu.`
            interaction.reply({content:yazi3, ephemeral: true});
        }
    }
};
