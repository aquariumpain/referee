const Discord = require('discord.js');
const Manager = new Discord.ShardingManager('./referee.js');
Manager.spawn(2);
