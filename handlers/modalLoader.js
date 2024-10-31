const {readdirSync} = require('fs');
const path = require("path")
var AsciiTable = require('ascii-table')
var table = new AsciiTable()
table.setHeading('Modal', 'Stats').setBorder('|', '=', "0", "0")

module.exports = (client) => {
    readdirSync('./modals/').filter((file) => file.endsWith('.js')).forEach((modal) => {
      	require(`../modals/${modal}`);
	table.addRow(modal.split('.js')[0], 'basarili')
    })
	
	console.log(table.toString())
};