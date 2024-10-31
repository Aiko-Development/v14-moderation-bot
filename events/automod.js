const client = require("..");
const db = require("orio.db");
const {JsonProvider} = require("ervel.db")
const db1 = new JsonProvider("./DataBase/lang.json",".")

async function getServerLanguage(guildId) {
    const lang = await db1.fetch(`lang_${guildId}`);
    return lang || 'en'; 
}



client.on("guildMemberAdd",async member => {
    const guildId = member.guild.id;
    const lang = await getServerLanguage(guildId);

    var lo1 = lang ==="en" ? `<:live:1205604073534136370> Welcome to the server, ${member.user} I automatically assigned you the auto role`:`<:live:1205604073534136370> Sunucuya hoş geldiniz, ${member.user} Size otorolünü atadım`
   

    var log = db.get(`autoRoleChannel_${member.guild.id}`) 

    var mesaj = db.get(`automsg_${member.guild.id}`) || lo1
    if (!member.user.bot) { 
    if(log) {

    var autoroles = db.get(`autorole_user_${member.guild.id}`) 
    if(!autoroles) return
    
    client.channels.cache.get(log).send(mesaj)
    member.roles.add(autoroles)
  

} else {
    var autoroles = db.get(`autorole_user_${member.guild.id}`)
    
    if(!autoroles) return
    
    member.roles.add(autoroles)

}
    }

})

client.on("guildMemberAdd",async member => {

    const guildId = member.guild.id;
    const lang = await getServerLanguage(guildId);
var lo2 = lang === "en" ? `<:live:1205604073534136370> A bot joined our server and was given the set authority. Joining bot ${member.user}!`:`<:live:1205604073534136370> Sunucumuza bir bot katıldı ve kendisine belirlenen yetki verildi. Katılan bot ${member.user}!`

    var log = db.get(`autoRoleChannel_${member.guild.id}`) 



    var mesaj2 = db.get(`botautomsg_${member.guild.id}`) || lo2
    if (member.user.bot) {
    if(log){
        var autoroles = db.get(`autorole_bot_${member.guild.id}`)
    
        if(!autoroles) return
        
        member.roles.add(autoroles)
        client.channels.cache.get(log).send(mesaj2)

 } else{
    var autoroles = db.get(`autorole_bot_${member.guild.id}`)
    
    if(!autoroles) return
    
    member.roles.add(autoroles)


}
    
    }

})
