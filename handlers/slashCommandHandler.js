const fs = require('fs');
const {Routes, REST} = require("discord.js")
const AsciiTable = require('ascii-table');

const { BOTID, TOKEN } = require("../Bot/set/config");
const table = new AsciiTable().setHeading('Slash Commands(OK)', 'Stats').setBorder('|', '=', "0", "0")

const rest = new REST({version : "10"}).setToken(TOKEN);


module.exports = (client, message) => {
	const slashCommands = []; 

	fs.readdirSync('./Commands/').forEach(async dir => {
		const files = fs.readdirSync(`./Commands/${dir}/`).filter(file => file.endsWith('.js'));

		for(const file of files) {
				const slashCommand = require(`../Commands/${dir}/${file}`);
				slashCommands.push({
					name: slashCommand.name,
					description: slashCommand.description,
					type: slashCommand.type,
					options: slashCommand.options ? slashCommand.options : null,
					default_permission: slashCommand.default_permission ? slashCommand.default_permission : null,
					default_member_permissions: slashCommand.default_member_permissions ? PermissionsBitField.resolve(slashCommand.default_member_permissions).toString() : null
				});
			
		if(slashCommand.name) {
						client.slashCommands.set(slashCommand.name, slashCommand)
						table.addRow(file.split('.js')[0], 'basarili')
				} else {
						table.addRow(file.split('.js')[0], 'basarisiz')
				}
		}
		
	});
	console.log(table.toString());

	(async () => {
			try {
				await rest.put(

					Routes.applicationCommands("1274441291735896105"), 
					{ body: slashCommands }
				);
				console.log('Slash Commands • Connect')
			} catch (error) {
				console.log(error);
			}
	})();
};

