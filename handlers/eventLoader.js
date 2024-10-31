const {readdirSync} = require('fs');
const path = require("path")
var AsciiTable = require('ascii-table')
var table = new AsciiTable()
table.setHeading('Events', 'Stats').setBorder('|', '=', "0", "0")

module.exports = (client) => {
    readdirSync('./events/').filter((file) => file.endsWith('.js')).forEach((event) => {
      	require(`../events/${event}`);
	table.addRow(event.split('.js')[0], 'basarili')
    })
	
	console.log(table.toString())
};