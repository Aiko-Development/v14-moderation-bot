const { ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const {JsonProvider} = require("ervel.db")
 const db = new JsonProvider("./DataBase/lang.json",".")


 async function getServerLanguage(guildId) {
    const lang = await db.fetch(`lang_${guildId}`);
    return lang || 'en'; 
}

module.exports = {
    name: 'setlanguage',
    description: "Change the server's language.",
    type: ApplicationCommandType.ChatInput,
    cooldown: 3000,
    options: [
        {
            name: 'language',
            description: 'Select a language',
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                {
                    name: 'English',
                    value: 'en'
                },
                {
                    name: 'Türkçe',
                    value: 'tr'
                },
               
            ]
        }
    ],
    run: async (client, interaction) => {
        const selectedLanguage = interaction.options.getString('language');
        const guildId = interaction.guild.id;
        if (!interaction.member.permissions.has('Administrator')) {
            return interaction.reply({ content: lang === 'en' ?'> <:unsuces_option:1182742290020708364> You must have the \`Administrator\` permission to use this command.': `> <:unsuces_option:1182742290020708364> Bu komutu kullanmak için \`Yönetici\` iznine sahip olmanız gerekmektedir.`, ephemeral: true });
        }
       
        await db.set(`lang_${guildId}`, selectedLanguage);

        await interaction.deferReply()
        await interaction.editReply(`Language has been successfully set to **${selectedLanguage === 'en' ? 'English' : 'Türkçe'}**.`);
    }
};





