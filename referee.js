const Discord = require("discord.js");
const storage = require('node-persist');
const bot = new Discord.Client();
const trivia = require('./trivia.js');
const ytdl = require('ytdl-core');
const utils = require('./utils.js');
const token = require('./token.js');
const votemodule = require('./vote.js');
const cleverbotio = require('cleverbot.io');
const snekfetch = require('snekfetch');
const cleverbot = new cleverbotio(token.cleverbotiouser, token.cleverbotiokey);
cleverbot.setNick("cleverbotreferee");
const fs = require('fs');
const Log = require('log');
const log = new Log('info', fs.createWriteStream('commandslog.log'));
const redgeyId = "193884876527632385";

var prefix = "()";
var refereeserverlink = "https://discord.gg/CncfjgM";
var refereeinvitelink = "https://discordapp.com/oauth2/authorize?client_id=289194076258172928&scope=bot&permissions=2146696319";
var currentspammedwords;
var spamword;
var spamgoal;
var musicDisp = {};
var triviamoduleobjects = {};
var morse = {
	" " : " | ",
	"a" : ".-",
	"b" : "-...",
	"c" : "-.-.",
	"d" : "-..",
	"e" : ".",
	"f" : "..-.",
	"g" : "--.",
	"h" : "....",
	"i" : "..",
	"j" : ".---",
	"k" : "-.-",
	"l" : ".-..",
	"m" : "--",
	"n" : "-.",
	"o" : "---",
	"p" : ".--.",
	"q" : "--.-",
	"r" : ".-.",
	"s" : "...",
	"t" : "-",
	"u" : "..-",
	"v" : "...-",
	"w" : ".--",
	"x" : "-..-",
	"y" : "-.--",
	"z" : "--.."};
var voteobjects = {};
var votedusers = [];
var commands = {
	"ping": {
		"response": function(bot, msg) {
			const embed = new Discord.RichEmbed()
			.setColor(0x00FF00)
			.setTitle("Pong! Your ping is " + bot.ping + "ms");
			//.setFooter("referee-Shard " + bot.shard.id, "https://cdn.discordapp.com/avatars/289194076258172928/b0c96ffd7f8d65e88550afe8fc288e35.jpg?size=1024");
			msg.channel.send({embed});
		},
		"bio": "Returns average ping",
		"syntax": "ping"
	},
	"say": {
		"response": function(bot, msg, args) {
			if (args) {
				var string = args.trim();
				if (!string.startsWith(prefix)) {
					msg.channel.send(args);
				}
				else {
					const embed = new Discord.RichEmbed()
					.setColor(0xFF0000)
					.setTitle("Uh Oh! You can't make me do commands!");
					msg.channel.send({embed});
				}
			}
			else {
				const embed = new Discord.RichEmbed()
				.setColor(0xFF0000)
				.setTitle("Uh Oh! Please give something to say!");
				msg.channel.send({embed});
			}
		},
		"bio": "Makes referee say something",
		"syntax": "say <something to say>"
	},
	"help": {
		"response": function(bot, msg, args) {
			if (!args) {
				var serverprefix = storage.getItemSync(msg.guild.id + "_prefix");
				if (!serverprefix) {
					serverprefix = "None";
				}
				const embed3 = new Discord.RichEmbed()
				.setColor(0x00FFFF)
				.addField("Default referee Prefix", "`" + prefix + "`", false)
				.addField(msg.guild.name + "'s Custom Prefix", "`" + serverprefix + "`", false)
				.addField("Join the Official referee server", refereeserverlink, false)
				.addField("Invite referee to your server", refereeinvitelink, false);
				//.setFooter("referee-Shard " + bot.shard.id, "https://cdn.discordapp.com/avatars/289194076258172928/b0c96ffd7f8d65e88550afe8fc288e35.jpg?size=1024");
				msg.author.send({embed3});
				var helparray = getHelpDescription();
				for (var i = 0; i < helparray.length; i += 15) {
					var joined = helparray.slice(i, (i+15));
					const embed = new Discord.RichEmbed()
					.setColor(0x00FFFF)
					.setTitle("Available referee Commands")
					.setDescription(joined);
					//.setFooter("referee-Shard " + bot.shard.id, "https://cdn.discordapp.com/avatars/289194076258172928/b0c96ffd7f8d65e88550afe8fc288e35.jpg?size=1024");
					msg.author.send({embed});
				}
				const embed2 = new Discord.RichEmbed()
				.setColor(0x00FFFF)
				.setTitle("A list of commands has been sent to your DMs")
				//.setFooter("referee-Shard " + bot.shard.id, "https://cdn.discordapp.com/avatars/289194076258172928/b0c96ffd7f8d65e88550afe8fc288e35.jpg?size=1024");
				msg.channel.send({embed2});
			}
			else {
				var command = commands[args];
				if (command) {
					var serverprefix = storage.getItemSync(msg.guild.id + "_prefix");
					if (!serverprefix) {
						serverprefix = prefix;
					}
					const embed = new Discord.RichEmbed()
					.setColor(0x00FFFF)
					.addField(prefix + args + " - " + command.bio, "Usage: " + serverprefix + command.syntax, false);
					//.setFooter("referee-Shard " + bot.shard.id, "https://cdn.discordapp.com/avatars/289194076258172928/b0c96ffd7f8d65e88550afe8fc288e35.jpg?size=1024");
					msg.channel.send({embed});
				}
				else {
					const embed = new Discord.RichEmbed()
					.setColor(0xFF0000)
					.setTitle("Uh Oh! Please give a valid command!");
					msg.channel.send({embed});
				}
			}
		},
		"bio": "Displays a list of commands or more detailed info about a command",
		"syntax": "help [command]"
	},
	"setadminrole": {
		"response": function (bot, msg, args) {
			if (isAdminRole(msg.member) == true) {
				if (args) {
					role = msg.guild.roles.find(function(el) {
						return el.name == args;
					});;
					if (role == null) {
						const embed = new Discord.RichEmbed()
						.setColor(0xFF0000)
						.setTitle("Uh Oh! Please give a valid role!");
						msg.channel.send({embed});
					}
					else {
						storage.setItemSync(msg.guild.id + "_adminroleid", role.id);
						const embed = new Discord.RichEmbed()
						.setColor(0x00FFFF)
						.setTitle("Admin Role Set to " + role.name + "!");
						msg.channel.send({embed});
					}
				}
				else {
					storage.removeItemSync(msg.guild.id + "_adminroleid")
					const embed = new Discord.RichEmbed()
					.setColor(0x00FFFF)
					.setTitle("Admin Role Reset!");
					msg.channel.send({embed});
				}
			}
			else {
				const embed = new Discord.RichEmbed()
				.setColor(0xFF0000)
				.setTitle("Uh Oh! Looks like you don't have permission to use this command!");
				msg.channel.send({embed});
			}
		},
		"bio": "Sets Admin Role. Leaving the role name blank will reset your current admin role. *(ADMIN COMMAND)*",
		"syntax": "setadminrole <role name>"
	},
	"event": {
		"response": function(bot, msg, args) {
			var arglist = parseArguments(args, 3);
			var eventtype = arglist[0];
			var arg1 = arglist[1];
			var arg2 = arglist[2];
			if(isAdminRole(msg.member) == true) {
				if (!storage.getItemSync(msg.guild.id + "_eventactive")) {
					if (eventtype.toLowerCase() == "trivia") {
						if (msg.guild.me.hasPermission("MANAGE_CHANNELS")) {
							storage.setItemSync(msg.guild.id + "_eventactive", true);
							var triviachannel = msg.guild.channels.find(function(el) {
								return el.name == "trivia" && el.type == "text";
							});
							if (!triviachannel) {
								msg.guild.createChannel("trivia", "text").then( function(el) {
									triviachannel = el;
								});
							}
							var thistriviamodule = new trivia.create();
							triviamoduleobjects[msg.guild.id + "_triviamodule"] = thistriviamodule;
							thistriviamodule.triviaStart(triviachannel, Discord, storage, bot);
						}
						else {
							const embed = new Discord.RichEmbed()
							.setColor(0xFF0000)
							.setTitle(":no_entry: Error! I do not have the Manage Channels permission!");
							msg.channel.send({embed});
						}
					}
					else if (eventtype.toLowerCase() == "spam") {
						if (!isNaN(arg2)) {
							storage.setItemSync(msg.guild.id + "_eventactive", true);
							storage.setItemSync(msg.guild.id + "_spamword", arg1);
							storage.setItemSync(msg.guild.id + "_spamgoal", arg2);
							storage.setItemSync(msg.guild.id + "_spamcurrentcounter", 0);
							spamWordEvent();
							const embed = new Discord.RichEmbed()
							.setColor(0x00FFFF)
							.setTitle("Spam Event Started. The word is " + arg1 + "!");
							msg.channel.send({embed});
						}
						else {
							const embed = new Discord.RichEmbed()
							.setColor(0xFF0000)
							.setTitle("Uh Oh! Please give a valid number of words to spam!");
							msg.channel.send({embed});
						}
					}
					else {
						const embed = new Discord.RichEmbed()
						.setColor(0xFF0000)
						.setTitle("Uh Oh! Please give a valid event type such as Trivia or Spam!");
						msg.channel.send({embed});
					}
				}
				else if (eventtype.toLowerCase() == "cancel") {
					var triviachannel = msg.guild.channels.find(function(el) {
						return el.name == "trivia";
					});
					var thistriviamodule = triviamoduleobjects[msg.guild.id + "_triviamodule"];
					if (thistriviamodule) {
						thistriviamodule.resetTrivia(storage, msg, triviachannel);
					}
					//storage.setItemSync(msg.guild.id + "_eventactive", false);
					bot.emit('spamcanceled');
					const embed = new Discord.RichEmbed()
					.setColor(0xFF0000)
					.setTitle("Event Canceled");
					msg.channel.send({embed});
				}
				else {
					const embed = new Discord.RichEmbed()
					.setColor(0xFF0000)
					.setTitle("Uh Oh! Looks like there's already an event in progress!");
					msg.channel.send({embed});
				}
			}
			else {
				const embed = new Discord.RichEmbed()
				.setColor(0xFF0000)
				.setTitle("Uh Oh! Looks like you don't have permission to use this command!");
				msg.channel.send({embed});
			}
		},
		"bio": "Starts an event. *(ADMIN COMMAND)* \n Available Events: Trivia, Spam. (spam is an event where people have to spam a word a specified number of times and the last person wins) ",
		"syntax": "event <event name|cancel> [word to spam] [amount of times to spam]"
	},
	"rate": {
		"response": function(bot, msg, args) {
			if (args) {
				var text = args;
				if (text.length < 200) {
					const embed = new Discord.RichEmbed()
					.setColor(0x00FF00)
					.setTitle(msg.author.username + ", I rate " + args + " a " + utils.getRandomIntInclusive(0,10) + "/10");
					//.setFooter("referee-Shard " + bot.shard.id, "https://cdn.discordapp.com/avatars/289194076258172928/b0c96ffd7f8d65e88550afe8fc288e35.jpg?size=1024");
					msg.channel.send({embed});
				}
				else {
					const embed = new Discord.RichEmbed()
					.setColor(0xFF0000)
					.setTitle("Uh Oh! How do I rate something I can't even say!?!");
					msg.channel.send({embed});
				}
			}
			else {
				const embed = new Discord.RichEmbed()
				.setColor(0xFF0000)
				.setTitle("Uh Oh! Please give something to rate!");
				msg.channel.send({embed});
			}
		},
		"bio": "Rates something",
		"syntax": "rate <something to rate>"
	},
	"score": {
		"response": function(bot, msg) {
			if (storage.getItemSync(msg.author.id + msg.guild.id + "_score")) {
				const embed = new Discord.RichEmbed()
				.setColor(0x00FF00)
				.setTitle("Your score is " + storage.getItemSync(msg.author.id + msg.guild.id + "_score") + "!", {split:true});
				//.setFooter("referee-Shard " + bot.shard.id, "https://cdn.discordapp.com/avatars/289194076258172928/b0c96ffd7f8d65e88550afe8fc288e35.jpg?size=1024");
				msg.channel.send({embed});
			}
			else {
				const embed = new Discord.RichEmbed()
				.setColor(0x00FF00)
				.setTitle("Uh Oh! Looks like you don't have a score. Talk in the channels to get points!");
				msg.channel.send({embed});
			}
		},
		"bio": "Returns your score",
		"syntax": "score"
	},
	"clearscore": {
		"response": function(bot, msg, args) {
			storage.removeItem(msg.author.id + msg.guild.id + "_score");
			const embed = new Discord.RichEmbed()
			.setColor(0x00FF00)
			.setTitle(msg.author.username + "'s score has been reset");
			msg.channel.send({embed});
		},
		"bio": "Clears your balance",
		"syntax": "clearscore"
	},
	"clearallscores": {
		"response": function(bot, msg) {
			if(isAdminRole(msg.member) == true) {
				msg.guild.members.forEach(function(el) {
					storage.removeItemSync(el.id + msg.guild.id + "_score");
				});
				const embed = new Discord.RichEmbed()
				.setColor(0x00FF00)
				.setTitle("All Scores Cleared!");
				msg.channel.send({embed});
			}
			else {
				const embed = new Discord.RichEmbed()
				.setColor(0xFF0000)
				.setTitle("Uh Oh! Looks like you don't have permission to use this command!");
				msg.channel.send({embed});
			}
		},
		"bio": "Clears all scores *(ADMIN COMMAND)*",
		"syntax": "clearallscores"
	},
	"leaderboard": {
		"response": function(bot, msg, args) {
			var allscores = msg.guild.members
				.filter(function(el) {
					return !el.user.bot;
				})
				.map(function(el) {
					var currentscore = storage.getItemSync(el.id + msg.guild.id + "_score");
					if (!currentscore) {
						currentscore = 0;
					}
					return { usernamediscrim : el.user.username + "#" + el.user.discriminator, id : el.id, score : currentscore};
				});
			for (var src = 0; src < allscores.length; src++) {
				// try to bubble up
				for (var dst = src - 1; dst >= 0; dst--) {
					if (allscores[src].score > allscores[dst].score) {
						// swap
						var tmp = allscores[dst];
						allscores[dst] = allscores[src];
						allscores[src] = tmp;
						src--;
					}
				}
			}
			var count = Math.min(10, allscores.length);
			var leaderboardoutput = "";
			for (var i = 0; i < count; i++) {
				leaderboardoutput += (i+1) + ". " + allscores[i].usernamediscrim + " \n \t Score: " + allscores[i].score + "\n";
			}
			var rank = allscores.findIndex(function(el) {
				return el.id == msg.author.id;
			});
			msg.channel.send(":clipboard: **" + msg.guild.name + "'s Leaderboard**\n```" + leaderboardoutput + " \n ------------------------------------------------------ \n▶ Your Rank: " + (rank+1) + " - Your Score: " + storage.getItemSync(msg.author.id + msg.guild.id + "_score") + "  👀```", {split:true});
		},
		"bio": "Displays a leaderboard for this server",
		"syntax": "leaderboard"
	},
	"add": {
		"response": function(bot, msg, args) {
			var amount = parseInt(args);
			if (isNaN(args) || args == "") {
				const embed = new Discord.RichEmbed()
				.setColor(0xFF0000)
				.setTitle("Uh Oh! Please give a valid amount!");
				msg.channel.send({embed});
			}
			else {
				 	var value = storage.getItemSync(msg.member.id + msg.guild.id + "_money");
					if (!value) {
						value = 0;
					}
					value += amount;
					storage.setItem(msg.member.id + msg.guild.id + "_money", value);
					const embed = new Discord.RichEmbed()
					.setColor(0x00FF00)
					.setTitle("You now have " + value + ":moneybag:s", {split:true});
					msg.channel.send({embed});
			}
		},
		"bio": "Adds an amount to your balance",
		"syntax": "add <amount>"
	},
	"value": {
		"response": function(bot, msg, args) {
			if (storage.getItemSync(msg.member.id + msg.guild.id + "_money") == undefined || storage.getItemSync(msg.member.id + msg.guild.id + "_money") == 0) {
				const embed = new Discord.RichEmbed()
				.setColor(0x00FF00)
				.setTitle("Looks like you've got nothing in your account. Do $add <amount> to get some money");
				msg.channel.send({embed});
			}
			else {
				const embed = new Discord.RichEmbed()
				.setColor(0x00FF00)
				.setTitle(msg.author.username + " has " + storage.getItemSync(msg.member.id + msg.guild.id + "_money") + ":moneybag:", {split:true});
				//.setFooter("referee-Shard " + bot.shard.id, "https://cdn.discordapp.com/avatars/289194076258172928/b0c96ffd7f8d65e88550afe8fc288e35.jpg?size=1024");
				msg.channel.send({embed});
			}
		},
		"bio": "Checks your balance",
		"syntax": "value"
	},
	"clearvalue": {
		"response": function(bot, msg, args) {
			storage.removeItem(msg.member.id + msg.guild.id + "_money");
			const embed = new Discord.RichEmbed()
			.setColor(0x00FF00)
			.setTitle(msg.author.username + "'s value has been reset");
			msg.channel.send({embed});
		},
		"bio": "Clears your balance",
		"syntax": "clearvalue"
	},
	"dice": {
		"response": function(bot, msg, args) {
			const embed = new Discord.RichEmbed()
			.setColor(0xFFFFFF)
			.setTitle(":game_die: " + utils.getRandomIntInclusive(1, 6) + " :game_die:");
			//.setFooter("referee-Shard " + bot.shard.id, "https://cdn.discordapp.com/avatars/289194076258172928/b0c96ffd7f8d65e88550afe8fc288e35.jpg?size=1024");
			msg.channel.send({embed});
		},
		"bio": "Rolls dice",
		"syntax": "dice"
	},
	"slots": {
		"response": function(bot, msg, args) {
			if (isNaN(args) || args == "") {
				const embed = new Discord.RichEmbed()
				.setColor(0xFF0000)
				.setTitle("Uh Oh! Please give a valid bet!");
			}
			else {
				var bet = parseInt(args);
				if (storage.getItemSync(msg.member.id + msg.guild.id + "_money") < bet) {
					const embed = new Discord.RichEmbed()
					.setColor(0xFF0000)
					.setTitle("You can't play! You don't even have what you're betting! Do $add <amount> to get more money");
					msg.channel.send({embed});
				}
				else {
					var one = utils.getRandomIntInclusive(1,3);
					var two = utils.getRandomIntInclusive(1,3);
					var three = utils.getRandomIntInclusive(1,3);
					var winorloss = "";
					if (one == two && one == three) {
						winorloss = "You Won " + (bet + 500) + " :moneybag:s!"
						storage.getItem(msg.member.id + msg.guild.id + "_money").then(function (value) {
							if (!value) {
								value = 0;
							}
							value += (bet + 500);
							storage.setItem(msg.member.id + msg.guild.id + "_money", value);
						});
				 	}
				 	else {
						winorloss = "You lost " + args + ":moneybag:s"
						storage.getItem(msg.member.id + msg.guild.id + "_money").then(function (value) {
							if (!value) {
								value = 0;
							}
							value -= bet;
							storage.setItem(msg.member.id + msg.guild.id + "_money", value);
						});
				 	}
					const embed = new Discord.RichEmbed()
					.setColor(0x00FF00)
					.setTitle("Slots")
					.setDescription(
					"-- " + (one-1) + " " + (two-1) + " " + (three-1) + " -- \n" +
					"**-- " + one + " " + two + " " + three + " --** \n" +
					"-- " + (one+1) + " " + (two+1) + " " + (three+1) +  " --")
					.addField("Result", winorloss, true)
					//.setFooter("referee-Shard " + bot.shard.id, "https://cdn.discordapp.com/avatars/289194076258172928/b0c96ffd7f8d65e88550afe8fc288e35.jpg?size=1024");
					.setAuthor(msg.author.username, msg.author.avatarURL);
					msg.channel.send({embed});
				}
			}
		},
		"bio": "Plays slots",
		"syntax": "slots <bet>"
	},
	"getrolesettings": {
		"response": function(bot, msg, args) {
			if(isAdminRole(msg.member) == true) {
				if (args) {
					arglist = parseArguments(args, 2);
					arg1 = arglist[0];
					arg2 = arglist[1];
					if (arg1 == "add") {
						var roletoadd = msg.guild.roles.find(function(el) {
							return el.name == arg2;
						});
						if (roletoadd) {
							var rolearray = storage.getItemSync(msg.guild.id + "_availablegetroles");
							if (!rolearray) {
								rolearray = [];
							}
							rolearray.push(roletoadd.id);
							storage.setItemSync(msg.guild.id + "_availablegetroles", rolearray);
							const embed = new Discord.RichEmbed()
							.setColor(0x00FF00)
							.setTitle("Role " + roletoadd.name + " added as an available role for the getrole command!");
							msg.channel.send({embed});
						}
						else {
							const embed = new Discord.RichEmbed()
							.setColor(0xFF0000)
							.setTitle("Uh Oh! Please give a valid role!");
							msg.channel.send({embed});
						}
					}
					else if (arg1 == "remove") {
						var roletoremove = msg.guild.roles.find(function(el) {
							return el.name == arg2;
						});
						if (roletoremove) {
							var rolearray = storage.getItemSync(msg.guild.id + "_availablegetroles");
							if (rolearray) {
								var index = rolearray.indexOf(roletoremove.id);
								if (index && index > -1) {
	    						rolearray.splice(index, 1);
									storage.setItemSync(msg.guild.id + "_availablegetroles", rolearray);
									const embed = new Discord.RichEmbed()
									.setColor(0x00FF00)
									.setTitle("Role removed from available roles for the getrole command!");
									msg.channel.send({embed});
								}
								else {
									const embed = new Discord.RichEmbed()
									.setColor(0xFF0000)
									.setTitle("Uh Oh! This role is not set as an getrole!");
									msg.channel.send({embed});
								}
							}
							else {
								const embed = new Discord.RichEmbed()
								.setColor(0xFF0000)
								.setTitle("Uh Oh! It looks like you don't have any getroles set!");
								msg.channel.send({embed});
							}
						}
						else {
							const embed = new Discord.RichEmbed()
							.setColor(0xFF0000)
							.setTitle("Uh Oh! Please give a valid role!");
							msg.channel.send({embed});
						}
					}
					else if (arg1 == "clear") {
						var rolearray = storage.getItemSync(msg.guild.id + "_availablegetroles");
						if (rolearray) {
							storage.removeItemSync(msg.guild.id + "_availablegetroles");
							const embed = new Discord.RichEmbed()
							.setColor(0x00FF00)
							.setTitle("Getroles Reset!");
							msg.channel.send({embed});
						}
						else {
							const embed = new Discord.RichEmbed()
							.setColor(0xFF0000)
							.setTitle("Uh Oh! It looks like you don't have any getroles set!");
							msg.channel.send({embed});
						}
					}
					else if (arg1 == "list") {
						var rolearray = storage.getItemSync(msg.guild.id + "_availablegetroles");
						var rolelist = "";
						if (rolearray) {
							rolearray.forEach(function (el) {
								var role = msg.guild.roles.find(function(ele) {
									return ele.id == el;
								});
								rolelist += role.name + " | ";
							});
							const embed = new Discord.RichEmbed()
							.setColor(0x00FFFF)
							.setTitle("All GetRole Roles for " + msg.guild.name)
							.setDescription(rolelist);
							msg.channel.send({embed});
						}
						else {
							const embed = new Discord.RichEmbed()
							.setColor(0xFF0000)
							.setTitle("Uh Oh! It looks like you don't have any getroles set!");
							msg.channel.send({embed});
						}
					}
					else {
						const embed = new Discord.RichEmbed()
						.setColor(0xFF0000)
						.setTitle("Uh Oh! Please specify whether to add, remove, clear, or list getroles!");
						msg.channel.send({embed});
					}

				}
				else {
					const embed = new Discord.RichEmbed()
					.setColor(0xFF0000)
					.setTitle("Uh Oh! Please give valid arguments!");
					msg.channel.send({embed});
				}
			}
			else {
				const embed = new Discord.RichEmbed()
				.setColor(0xFF0000)
				.setTitle("Uh Oh! Looks like you don't have permission to use this command!");
				msg.channel.send({embed});
			}
		},
		"bio": "Adds a role to the getrole command *(ADMIN COMMAND)* ***MAKE SURE THAT THE referee ROLE IS HIGHER THAN THE GETROLE ROLE***",
		"syntax": "addgetrole <role name>"
	},
	"getrole": {
		"response": function(bot, msg, args) {
			if (msg.guild.me.hasPermission("MANAGE_ROLES")) {
				var roletoadd = msg.guild.roles.find(function(el) {
					return el.name == args;
				});
				if (roletoadd) {
					var availableroles = storage.getItemSync(msg.guild.id + "_availablegetroles");
					var gettable = availableroles.find(function(el) {
						return el == roletoadd.id;
					});
					if (gettable) {
						try {
							msg.member.addRole(roletoadd).then(
								function (u) {
								},
								function (reason) {
								}
							);
						}
						catch (e) {
						}
						const embed = new Discord.RichEmbed()
						.setColor(0x00FF00)
						.setTitle("You have received the " + roletoadd.name + " role!");
						msg.channel.send({embed});
					}
					else {
						const embed = new Discord.RichEmbed()
						.setColor(0xFF0000)
						.setTitle("Uh Oh! Please give a role that I can add!");
						msg.channel.send({embed});
					}
				}
				else {
					const embed = new Discord.RichEmbed()
					.setColor(0xFF0000)
					.setTitle("Uh Oh! Please give a valid role!");
					msg.channel.send({embed});
				}
			}
			else {
				const embed = new Discord.RichEmbed()
				.setColor(0xFF0000)
				.setTitle(":no_entry: Error! I do not have the Manage Roles permission!");
				msg.channel.send({embed});
			}
		},
		"bio": "Gets you a role if it is available",
		"syntax": "getrole <role name>"
	},
	"autorole": {
		"response": function(bot, msg, args) {
			if (msg.guild.me.hasPermission("MANAGE_ROLES")) {
				if(isAdminRole(msg.member) == true) {
					if (args) {
						arglist = parseArguments(args, 2);
						arg1 = arglist[0];
						arg2 = arglist[1];
						if (arg1 == "add") {
							var roletoadd = msg.guild.roles.find(function(el) {
								return el.name == arg2;
							});
							if (roletoadd) {
								var rolearray = storage.getItemSync(msg.guild.id + "_autorole");
								if (!rolearray) {
									rolearray = [];
								}
								rolearray.push(roletoadd.id);
								storage.setItemSync(msg.guild.id + "_autorole", rolearray);
								const embed = new Discord.RichEmbed()
								.setColor(0x00FF00)
								.setTitle("The " + roletoadd.name + " role will now be added automatically when a user joins this server!");
								msg.channel.send({embed});
							}
							else {
								const embed = new Discord.RichEmbed()
								.setColor(0xFF0000)
								.setTitle("Uh Oh! Please give a valid role!");
								msg.channel.send({embed});
							}
						}
						else if (arg1 == "remove") {
							var roletoremove = msg.guild.roles.find(function(el) {
								return el.name == arg2;
							});
							if (roletoremove) {
								var rolearray = storage.getItemSync(msg.guild.id + "_autorole");
								if (rolearray) {
									var index = rolearray.indexOf(roletoremove.id);
									if (index && index > -1) {
		    						rolearray.splice(index, 1);
										storage.setItemSync(msg.guild.id + "_autorole", rolearray);
										const embed = new Discord.RichEmbed()
										.setColor(0x00FF00)
										.setTitle("Role removed from autoroles!");
										msg.channel.send({embed});
									}
									else {
										const embed = new Discord.RichEmbed()
										.setColor(0xFF0000)
										.setTitle("Uh Oh! This role is not set as an autorole!");
										msg.channel.send({embed});
									}
								}
								else {
									const embed = new Discord.RichEmbed()
									.setColor(0xFF0000)
									.setTitle("Uh Oh! It looks like you don't have any autoroles set!");
									msg.channel.send({embed});
								}
							}
							else {
								const embed = new Discord.RichEmbed()
								.setColor(0xFF0000)
								.setTitle("Uh Oh! Please give a valid role!");
								msg.channel.send({embed});
							}
						}
						else if (arg1 == "clear") {
							var rolearray = storage.getItemSync(msg.guild.id + "_autorole");
							if (rolearray) {
								storage.removeItemSync(msg.guild.id + "_autorole");
								const embed = new Discord.RichEmbed()
								.setColor(0x00FF00)
								.setTitle("Autoroles Reset!");
								msg.channel.send({embed});
							}
							else {
								const embed = new Discord.RichEmbed()
								.setColor(0xFF0000)
								.setTitle("Uh Oh! It looks like you don't have any autoroles set!");
								msg.channel.send({embed});
							}
						}
						else if (arg1 == "list") {
							var rolearray = storage.getItemSync(msg.guild.id + "_autorole");
							var rolelist = "";
							if (rolearray) {
								console.log(rolearray);
								rolearray.forEach(function (el) {
									var role = msg.guild.roles.find(function(ele) {
										return ele.id == el;
									});
									rolelist += role.name + " | ";
								});
								const embed = new Discord.RichEmbed()
								.setColor(0x00FFFF)
								.setTitle("All Autorole Roles for " + msg.guild.name)
								.setDescription(rolelist);
								msg.channel.send({embed});
							}
							else {
								const embed = new Discord.RichEmbed()
								.setColor(0xFF0000)
								.setTitle("Uh Oh! It looks like you don't have any autoroles set!");
								msg.channel.send({embed});
							}
						}
						else {
							const embed = new Discord.RichEmbed()
							.setColor(0xFF0000)
							.setTitle("Uh Oh! Please specify whether to add, remove, clear, or list autoroles!");
							msg.channel.send({embed});
						}
					}
					else {
						const embed = new Discord.RichEmbed()
						.setColor(0xFF0000)
						.setTitle("Uh Oh! Please give valid arguments!");
						msg.channel.send({embed});
					}
				}
				else {
					const embed = new Discord.RichEmbed()
					.setColor(0xFF0000)
					.setTitle("Uh Oh! Looks like you don't have permission to use this command!");
					msg.channel.send({embed});
				}
			}
			else {
				const embed = new Discord.RichEmbed()
				.setColor(0xFF0000)
				.setTitle(":no_entry: Error! I do not have the Manage Roles permission!");
				msg.channel.send({embed});
			}
		},
		"bio": "Automatically assigns roles when a user joins the server. *(ADMIN COMMAND)* ***MAKE SURE THAT THE referee ROLE IS HIGHER THAN THE AUTOROLE ROLE***",
		"syntax": "autorole <add|remove|clear (removes all roles)|list> [role name]"
	},
	"announce": {
		"response": function(bot, msg, args) {
			if(isAdminRole(msg.member) == true) {
				var ind = args.indexOf(" ");
				var arg1 = (ind >= 0) ? args.substring(0, ind) : args;
				var arg2 = (ind >= 0) ? args.substring(ind + 1) : "";
				var message = arg2;
				if (arg1 == "welcome") {
					if (arg2) {
						storage.setItemSync(msg.guild.id + "_welcomemessage", message);
						storage.setItemSync(msg.guild.id + "_welcomechannel", msg.channel.id);
						const embed = new Discord.RichEmbed()
						.setColor(0x00FFFF)
						.setTitle("Welcome Message Set!");
						msg.channel.send({embed});
					}
					else {
						storage.removeItemSync(msg.guild.id + "_welcomemessage");
						storage.removeItemSync(msg.guild.id + "_welcomechannel");
						const embed = new Discord.RichEmbed()
						.setColor(0x00FFFF)
						.setTitle("Welcome Message Reset!");
						msg.channel.send({embed});
					}
				}
				else if (arg1 == "leave") {
					if (arg2) {
						storage.setItemSync(msg.guild.id + "_leavemessage", message);
						storage.setItemSync(msg.guild.id + "_leavechannel", msg.channel.id);
						const embed = new Discord.RichEmbed()
						.setColor(0x00FFFF)
						.setTitle("Leave Message Set!");
						msg.channel.send({embed});
					}
					else {
						storage.removeItemSync(msg.guild.id + "_leavemessage");
						storage.removeItemSync(msg.guild.id + "_leavechannel");
						const embed = new Discord.RichEmbed()
						.setColor(0x00FFFF)
						.setTitle("Leave Message Reset!");
						msg.channel.send({embed});
					}
				}
				else {
					const embed = new Discord.RichEmbed()
					.setColor(0xFF0000)
					.setTitle("Uh Oh! Please give a valid announce type such as welcome or leave!");
					msg.channel.send({embed});
				}
			}
			else {
				const embed = new Discord.RichEmbed()
				.setColor(0xFF0000)
				.setTitle("Uh Oh! Looks like you don't have permission to use this command!");
				msg.channel.send({embed});
			}
		},
		"bio": "Sets an welcome or leave message. Leaving the message blank will clear your set message. Including {Mention} in the message mentions the user that joined. *(ADMIN COMMAND)*",
		"syntax": "announce <welcome|leave> <message>"
	},
	"serverinfo": {
		"response": function(bot, msg, args) {
			const embed = new Discord.RichEmbed()
			.setColor(0xFF00FF)
			.addField("Name", msg.guild.name, true)
			.addField("Owner", msg.guild.owner.user.username + "#" + msg.guild.owner.user.discriminator, true)
			.setThumbnail(msg.guild.iconURL)
			.addField("Channels", msg.guild.channels.size, true)
			.addField("Members", msg.guild.memberCount, true)
			.addField("Created", msg.guild.createdAt, true)
			.addField("ID", msg.guild.id, true)
			.setAuthor(msg.author.username, msg.author.avatarURL);
			//.setFooter("referee-Shard " + bot.shard.id, "https://cdn.discordapp.com/avatars/289194076258172928/b0c96ffd7f8d65e88550afe8fc288e35.jpg?size=1024");
			msg.channel.send({embed});
		},
		"bio": "Gives basic server info",
		"syntax": "serverinfo"
	},
	"avatar": {
		"response": function(bot, msg, args) {
			if(args == "") {
				args = msg.author.username + "#" + msg.author.discriminator;
			}
			var member;
			var mentionuser = msg.mentions.users.first();
			if (mentionuser) {
				member = mentionuser;
			}
			else {
				member = msg.guild.members.find(function(el) {
					return el.user.username + "#" + el.user.discriminator == args;
				});
				if (member) {
					member = member.user;
				}
			}
			if (member == null) {
				const embed = new Discord.RichEmbed()
				.setColor(0xFF0000)
				.setTitle("Uh Oh! I can't find the user you're looking for!");
				msg.channel.send({embed});
			}
			else {
				if (member.avatarURL == null) {
					const embed = new Discord.RichEmbed()
					.setColor(0xFF0000)
					.setTitle("Uh Oh! It looks like you don't have a set avatar!");
					msg.channel.send({embed});
				}
				else {
				const embed = new Discord.RichEmbed()
				.setColor(0x0000FF)
				.setTitle(member.username + "'s avatar.")
				.setURL(member.avatarURL)
				.setDescription("Here's a link: [url](" + member.avatarURL + ")")
				.setImage(member.avatarURL);
				//.setFooter("referee-Shard " + bot.shard.id, "https://cdn.discordapp.com/avatars/289194076258172928/b0c96ffd7f8d65e88550afe8fc288e35.jpg?size=1024");
				msg.channel.send({embed});
				}
			}
		},
		"bio": "Displays the avatar of a user (in this server) or self if no user is given",
		"syntax": "avatar <exampleuser#1234 | @exampleuser#1234>"
	},
	"userinfo": {
		"response": function(bot, msg, args) {
			if(args == "") {
				args = msg.author.username + "#" + msg.author.discriminator;
			}
			var member;
			var mentionuser = msg.mentions.users.first();
			if (mentionuser) {
				member = mentionuser;
			}
			else {
				member = msg.guild.members.find(function(el) {
					return el.user.username + "#" + el.user.discriminator == args;
				});
				if (member) {
					member = member.user;
				}
			}
			if (member == null) {
				const embed = new Discord.RichEmbed()
				.setColor(0xFF0000)
				.setTitle("Uh Oh! I can't find the user you're looking for!");
				msg.channel.send({embed});
			}
			else {
				const embed = new Discord.RichEmbed()
				.setColor(0x00FA9A)
				.addField("Name", member.username, true)
				.addField("Discriminator", member.discriminator, true)
				.addField("ID", member.id, true)
				.addField("Joined", member.createdAt, true)
				.setThumbnail(member.avatarURL)
				.setAuthor(msg.author.username, msg.author.avatarURL);
				//.setFooter("referee-Shard " + bot.shard.id, "https://cdn.discordapp.com/avatars/289194076258172928/b0c96ffd7f8d65e88550afe8fc288e35.jpg?size=1024");
				msg.channel.send({embed});
			}
		},
		"bio": "Displays info about a user (in this server) or self if no user is given",
		"syntax": "userinfo <exampleuser#1234 | @exampleuser#1234>"
	},
	"stats": {
		"response": function(bot, msg, args) {
			const embed = new Discord.RichEmbed()
			.setTitle("Bot Stats")
			.setColor(0xFF00FF)
			.addField("Name", bot.user.username, true)
			.addField("Owner", "redgey#9352", true)
			.setThumbnail(bot.user.avatarURL)
			.addField("Total Guilds", bot.guilds.size, true)
			.addField("Total Members", bot.users.size, true)
			.addField("Total Channels", bot.channels.size, true)
			.addField("Library", "discord.js", true);
			//.setFooter("referee-Shard " + bot.shard.id, "https://cdn.discordapp.com/avatars/289194076258172928/b0c96ffd7f8d65e88550afe8fc288e35.jpg?size=1024");
			msg.channel.send({embed});
		},
		"bio": "Gives basic bot info",
		"syntax": "stats"
	},
	"ban": {
		"response": function(bot, msg, args) {
			if (msg.guild.me.hasPermission("BAN_MEMBERS")) {
				if(isAdminRole(msg.member) == true) {
					var arglist = parseArguments(args, 2);
					var arg1 = arglist[0];
					var arg2 = arglist[1];
					var mentionuser = msg.mentions.users.first();
					if (mentionuser) {
						var member = msg.guild.members.find(function(el) {
							return el.id == mentionuser.id;
						});
						var days;
						if (arg2 && !isNaN(arg2)) {
							days = arg2;
							console.log(days)
							member.ban(days);
						}
						else {
							member.ban();
						}
						const embed = new Discord.RichEmbed()
						.setColor(0xFF0000)
						.setTitle(mentionuser.username + " Banned!");
						msg.channel.send({embed});
					}
					else {
						const embed = new Discord.RichEmbed()
						.setColor(0xFF0000)
						.setTitle("Uh Oh! Please give a valid user!");
						msg.channel.send({embed});
					}
					}

				else {
					const embed = new Discord.RichEmbed()
					.setColor(0xFF0000)
					.setTitle("Uh Oh! Looks like you don't have permission to use this command!");
					msg.channel.send({embed});
				}
			}
			else {
				const embed = new Discord.RichEmbed()
				.setColor(0xFF0000)
				.setTitle(":no_entry: Error! I do not have the Ban Members permission!");
				msg.channel.send({embed});
			}
		},
		"bio": "Bans a user *(ADMIN COMMAND)*",
		"syntax": "ban @user#1234 <how many days worth of messages to delete *(optional)*>"
	},
	"purge": {
		"response": function(bot, msg, args) {
			if (msg.guild.me.hasPermission("MANAGE_MESSAGES")) {
				if(isAdminRole(msg.member) == true) {
					if (!isNaN(args)) {
						var argamounttodelete = parseInt(args);
						var recentmessages = msg.channel.messages;
						var amounttodelete = (recentmessages.length < argamounttodelete) ? recentmessages.length : argamounttodelete;
						if (msg.channel) {
							msg.channel.bulkDelete(amounttodelete + 1).catch(console.error);
						}
					}
					else {
						const embed = new Discord.RichEmbed()
						.setColor(0xFF0000)
						.setTitle("Uh Oh! Please give a valid amount of messages to delete!");
						msg.channel.send({embed});
					}
				}
				else {
					const embed = new Discord.RichEmbed()
					.setColor(0xFF0000)
					.setTitle("Uh Oh! Looks like you don't have permission to use this command!");
					msg.channel.send({embed});
				}
			}
			else {
				const embed = new Discord.RichEmbed()
				.setColor(0xFF0000)
				.setTitle(":no_entry: Error! I do not have the Manage Messages permission!");
				msg.channel.send({embed});
			}
		},
		"bio": "Deletes a large amount of messages with a maximum of 100 *(ADMIN COMMAND)*",
		"syntax": "purge <amount of messages to delete>"
	},
	"prefix": {
		"response": function(bot, msg, args) {
			if(isAdminRole(msg.member) == true) {
				if (args) {
					if (args < 20) {
						storage.setItemSync(msg.guild.id + "_prefix", args);
						const embed = new Discord.RichEmbed()
						.setColor(0x00FFFF)
						.setTitle("Prefix set to `" + args + "`");
						msg.channel.send({embed});
					}
					else {
						const embed = new Discord.RichEmbed()
						.setColor(0xFF0000)
						.setTitle("Uh Oh! Please set a prefix shorter than 20 characters!");
						msg.channel.send({embed});
					}
				}
				else {
					storage.removeItemSync(msg.guild.id + "_prefix");
					const embed = new Discord.RichEmbed()
					.setColor(0x00FFFF)
					.setTitle("Current set prefix has been reset!");
					msg.channel.send({embed});
				}
			}
			else {
				const embed = new Discord.RichEmbed()
				.setColor(0xFF0000)
				.setTitle("Uh Oh! Looks like you don't have permission to use this command!");
				msg.channel.send({embed});
			}
		},
		"bio": "Sets a new prefix for your server *(ADMIN COMMAND)*",
		"syntax": "prefix <new prefix>"
	},
	"embed": {
		"response": function(bot, msg, args) {
			if (args) {
				if (args.length < 200) {
					const embed = new Discord.RichEmbed()
					.setColor(0x7B68EE)
					.setAuthor(msg.author.username, msg.author.avatarURL)
					.setDescription(args);
					//.setFooter("referee-Shard " + bot.shard.id, "https://cdn.discordapp.com/avatars/289194076258172928/b0c96ffd7f8d65e88550afe8fc288e35.jpg?size=1024");
					msg.channel.send({embed});
				}
				else {
					const embed = new Discord.RichEmbed()
					.setColor(0xFF0000)
					.setTitle("Uh Oh! How do I embed something I can't even say!?!");
					msg.channel.send({embed});
				}
			}
			else {
				const embed = new Discord.RichEmbed()
				.setColor(0xFF0000)
				.setTitle("Uh Oh! Please give something to embed!");
				msg.channel.send({embed});
			}
		},
		"bio": "Puts text in a nice embed",
		"syntax": "embed <text>"
	},
	"invite": {
		"response": function(bot, msg, args) {
			msg.channel.send(refereeinvitelink);
		},
		"bio": "Gives an invite to referee",
		"syntax": "invite"
	},
	"channeltoggle": {
		"response": function(bot, msg, args) {
			if(isAdminRole(msg.member) == true) {
				var channelarray = storage.getItemSync(msg.guild.id + "_disabledchannels");
				if (!channelarray) {
					channelarray = [];
				}
				if (channelarray.includes(msg.channel.id)) {
					var index = channelarray.indexOf(msg.channel.id);
					if (index && index > -1) {
						channelarray.splice(index, 1);
						storage.setItemSync(msg.guild.id + "_disabledchannels", channelarray);
						const embed = new Discord.RichEmbed()
						.setColor(0x00FFFF)
						.setTitle("Commands are now enabled for this channel!");
						msg.channel.send({embed});
					}
				}
				else {
					channelarray.push(msg.channel.id);
					const embed = new Discord.RichEmbed()
					.setColor(0x00FFFF)
					.setTitle("Commands are now disabled for this channel!");
					msg.channel.send({embed});
					storage.setItemSync(msg.guild.id + "_disabledchannels", channelarray);
				}
			}
			else {
				const embed = new Discord.RichEmbed()
				.setColor(0xFF0000)
				.setTitle("Uh Oh! Looks like you don't have permission to use this command!");
				msg.channel.send({embed});
			}
		},
		"bio": "Toggles commands in that channel *(ADMIN COMMAND)*",
		"syntax": "channeltoggle"
	},
	"coin": {
		"response": function(bot, msg, args) {
			var hort = utils.getRandomIntInclusive(1, 2) == 1 ? "Heads" : "Tails";
			const embed = new Discord.RichEmbed()
			.setColor(0xFFFFFF)
			.setTitle(hort);
			//.setFooter("referee-Shard " + bot.shard.id, "https://cdn.discordapp.com/avatars/289194076258172928/b0c96ffd7f8d65e88550afe8fc288e35.jpg?size=1024");
			msg.channel.send({embed});
		},
		"bio": "Flips coin",
		"syntax": "coin"
	},
	"choose": {
		"response": function(bot, msg, args) {
			var arglist = args.split(",");
			if (arglist) {
				var number = utils.getRandomIntInclusive(0, (arglist.length-1));
				const embed = new Discord.RichEmbed()
				.setColor(0xFFFFFF)
				.setTitle(arglist[number]);
				//.setFooter("referee-Shard " + bot.shard.id, "https://cdn.discordapp.com/avatars/289194076258172928/b0c96ffd7f8d65e88550afe8fc288e35.jpg?size=1024");
				msg.channel.send({embed});
			}
			else {
				const embed = new Discord.RichEmbed()
				.setColor(0xFF0000)
				.setTitle("Uh Oh! Please give something to choose!");
				msg.channel.send({embed});
			}
		},
		"bio": "Chooses between options separated by a comma (`,`)",
		"syntax": "choose option 1, option 2, option 3, ..."
	},
	"8ball": {
		"response": function(bot, msg, args) {
			if (args) {
				var answers = ["It is certain", "It is decidedly so", "Without a doubt", "Yes definitely", "You may rely on it", "As I see it, yes",
				"Most likely", "Outlook good", "Yes", "Signs point to yes", "Reply hazy try again", "Ask again later", "Better not tell you now", "Cannot predict now",
				"Concentrate and ask again", "Don't count on it", "My reply is no", "My sources say no", "Outlook not so good", "Very doubtful"];
				var number = utils.getRandomIntInclusive(0, (answers.length-1));
				const embed = new Discord.RichEmbed()
				.setColor(0xFFFFFF)
				.setTitle("Hmm... \n" + answers[number]);
				//.setFooter("referee-Shard " + bot.shard.id, "https://cdn.discordapp.com/avatars/289194076258172928/b0c96ffd7f8d65e88550afe8fc288e35.jpg?size=1024");
				msg.channel.send({embed});
			}
			else {
				const embed = new Discord.RichEmbed()
				.setColor(0xFF0000)
				.setTitle("Uh Oh! Please ask the 8ball a question!");
				msg.channel.send({embed});
			}
		},
		"bio": "Ask the 8ball a question",
		"syntax": "8ball"
	},
	"vote": {
		"response": function(bot, msg, args) {
			var arglist = parseArguments(args, 2);
			var arg1 = arglist[0];
			var options = arglist[1];
			if (arg1.toLowerCase() == "start") {
				if (storage.getItemSync(msg.guild.id + "_voteactive") == false) {
					var optionarray = options.split(';');
					if (options && optionarray.length > 0) {
						var topic = optionarray.shift();
						storage.setItemSync(msg.guild.id + "_voteactive", true);
						var thisvote = new votemodule.create();
						voteobjects[msg.guild.id + "_votemodule"] = thisvote;
						thisvote.startVote(topic, optionarray);
						var results = thisvote.getVotes();
						results.shift();
						var resultmessage = "**" + topic + "** \n```";
						for (var i = 0; i <= (results.length-1); i++) {
							resultmessage += "[" + (i+1) + "] : " + results[i].choice + " - " + results[i].votes + " votes \n"
						}
						msg.channel.send(resultmessage + "```");
					}
					else {
						const embed = new Discord.RichEmbed()
						.setColor(0xFF0000)
						.setTitle("Uh Oh! Please give valid options!");
						msg.channel.send({embed});
					}
				}
				else {
					const embed = new Discord.RichEmbed()
					.setColor(0xFF0000)
					.setTitle("Uh Oh! There is already a vote in progress!");
					msg.channel.send({embed});
				}
			}
			else if (arg1.toLowerCase() == "check") {
				var thisvote = voteobjects[msg.guild.id + "_votemodule"];
				var results = thisvote.getVotes();
				var topic = results.shift();
				var resultmessage = "**" + topic + "** \n```";
				for (var i = 0; i <= (results.length-1); i++) {
					resultmessage += "Option " + (i+1) + ": " + results[i].choice + " - " + results[i].votes + " votes \n"
				}
				msg.channel.send(resultmessage + "```");
			}
			else if (arg1.toLowerCase() == "end") {
				if (storage.getItemSync(msg.guild.id + "_voteactive") == true) {
					storage.setItemSync(msg.guild.id + "_voteactive", false);
					var thisvote = voteobjects[msg.guild.id + "_votemodule"];
					if (thisvote) {
						var results = thisvote.getVotes();
						var topic = results.shift();
						var resultmessage = "Vote Complete! Here are the results: \n**" + topic + "** \n```";
						for (var i = 0; i <= (results.length-1); i++) {
							resultmessage += "Option " + (i+1) + ": " + results[i].choice + " - " + results[i].votes + " votes \n"
						}
						msg.channel.send(resultmessage + "```");
						delete voteobjects[msg.guild.id + "_votemodule"];
						for (var i = 0; i < votedusers.length; i++) {
							var el = votedusers[i];
							if (el.startsWith(msg.guild.id)) {
	    					votedusers.splice(i, 1);
								i--;
							}
						}
					}
				}
				else {
					const embed = new Discord.RichEmbed()
					.setColor(0xFF0000)
					.setTitle("Uh Oh! There is no vote currently in progress!");
					msg.channel.send({embed});
				}
			}
			else if (arg1 && !isNaN(arg1)) {
				if (!votedusers.includes(msg.guild.id + "_" + msg.author.id)) {
					var thisvote = voteobjects[msg.guild.id + "_votemodule"];
					if (thisvote) {
						var results = thisvote.getVotes();
						results.shift();
						if (arg1 <= (results.length-1)) {
							var vote = parseInt(arg1);
							thisvote.addVote(vote);
							votedusers.push(msg.guild.id + "_" + msg.author.id);
							var results2 = thisvote.getVotes();
							var topic2 = results2.shift();
							var resultmessage = "**" + topic2 + "** \n```";
							for (var i = 0; i <= (results2.length-1); i++) {
								resultmessage += "Option " + (i+1) + ": " + results2[i].choice + " - " + results2[i].votes + " votes \n"
							}
							msg.channel.send(resultmessage + "```");
						}
						else {
							const embed = new Discord.RichEmbed()
							.setColor(0xFF0000)
							.setTitle("Uh Oh! Please give a valid vote!");
							msg.channel.send({embed});
						}
					}
					else {
						const embed = new Discord.RichEmbed()
						.setColor(0xFF0000)
						.setTitle("Uh Oh! There is currently no vote in progress!");
						msg.channel.send({embed});
					}
				}
				else {
					const embed = new Discord.RichEmbed()
					.setColor(0xFF0000)
					.setTitle("Uh Oh! You've already voted!");
					msg.channel.send({embed});
				}
			}
			else {
				const embed = new Discord.RichEmbed()
				.setColor(0xFF0000)
				.setTitle("Uh Oh! Please give a valid option such as start, check, end, or an option you are voting for!");
				msg.channel.send({embed});
			}
		},
		"bio": "Voting",
		"syntax": "vote <start|check|end> [vote topic; option 1; option 2; option 3; ...]"
	},
	"cleverbottoggle": {
		"response": function(bot, msg, args) {
			if(isAdminRole(msg.member) == true) {
				var cleverbotdisabledcurrent = storage.getItemSync(msg.guild.id + "_cleverbotdisabled");
				if (!cleverbotdisabledcurrent) {
					cleverbotdisabledcurrent = false;
				}
				if (cleverbotdisabledcurrent = false) {
					storage.setItemSync(msg.guild.id + "_cleverbotdisabled", true);
					const embed = new Discord.RichEmbed()
					.setColor(0x00FFFF)
					.setTitle("Cleverbot is now disabled for this server!");
					msg.channel.send({embed});
				}
				else {
					storage.removeItemSync(msg.guild.id + "_cleverbotdisabled");
					const embed = new Discord.RichEmbed()
					.setColor(0x00FFFF)
					.setTitle("Cleverbot is now enabled for this server!");
					msg.channel.send({embed});
				}
			}
			else {
				const embed = new Discord.RichEmbed()
				.setColor(0xFF0000)
				.setTitle("Uh Oh! Looks like you don't have permission to use this command!");
				msg.channel.send({embed});
			}
		},
		"bio": "Toggles clever in that server *(ADMIN COMMAND)*. To use cleverbot, just mention referee in the start of your message",
		"syntax": "cleverbottoggle"
	},
	"play": {
		"response": function(bot, msg, args) {
			if (msg.guild.me.hasPermission("CONNECT")) {
				if (isMusicAdminRole(msg.member) == true) {
					var voicechannel = msg.member.voiceChannel;
					if (voicechannel) {
						var queue = musicDisp[msg.guild.id + "_musicdispatcher"];
						if (!queue) {
		 					queue = { 'disp': null, 'options': { seek: 0, volume: 1 }, 'songs': [] };
							musicDisp[msg.guild.id + "_musicdispatcher"] = queue;
						}
						ytdl.getInfo(args).then(function (songinfo) {
							queue['songs'].push({ link: args, info: songinfo });
							const embed = new Discord.RichEmbed()
							.setColor(0x00FFFF)
							.setTitle("Song Added!");
							msg.channel.send({embed});
							if (!queue['disp']) {
								playNextSong(queue, voicechannel);
							}
						}, function (reason) {
							const embed = new Discord.RichEmbed()
							.setColor(0xFF0000)
							.setTitle("Uh Oh! Looks like you gave an invalid link!");
							msg.channel.send({embed});
						});

					}
					else {
						const embed = new Discord.RichEmbed()
						.setColor(0xFF0000)
						.setTitle("Uh Oh! Looks like you aren't in a voice channel!");
						msg.channel.send({embed});
					}
				}
				else {
					const embed = new Discord.RichEmbed()
					.setColor(0xFF0000)
					.setTitle("Uh Oh! Looks like you don't have permission to use this command!");
					msg.channel.send({embed});
				}
			}
			else {
				const embed = new Discord.RichEmbed()
				.setColor(0xFF0000)
				.setTitle(":no_entry: Error! I do not have the Connect permission so I can't join your voice channel!");
				msg.channel.send({embed});
			}
		},
		"bio": "Plays a song",
		"syntax": "play <youtube link>"
	},
	"stop": {
		"response": function(bot, msg, args) {
			if (isMusicAdminRole(msg.member) == true) {
				if(msg.member.voiceChannel && msg.guild.voiceConnection) {
					var queue = musicDisp[msg.guild.id + "_musicdispatcher"];
					if (queue) {
						queue['songs'].splice(1);
						queue['disp'].end();
						delete musicDisp[msg.guild.id + "_musicdispatcher"];
						const embed = new Discord.RichEmbed()
						.setColor(0x00FFFF)
						.setTitle("All songs removed from queue!");
						msg.channel.send({embed});
					}
					else {
						const embed = new Discord.RichEmbed()
						.setColor(0xFF0000)
						.setTitle("Uh Oh! Music is not currently playing!");
						msg.channel.send({embed});
					}
				}
			}
			else {
				const embed = new Discord.RichEmbed()
				.setColor(0xFF0000)
				.setTitle("Uh Oh! Looks like you don't have permission to use this command!");
				msg.channel.send({embed});
			}
		},
		"bio": "Stop playing music",
		"syntax": "stop"
	},
	"queue": {
		"response": function(bot, msg, args) {
			var queue = musicDisp[msg.guild.id + "_musicdispatcher"];
			if (queue) {
				var songs = queue['songs'];
				var description = "";
				songs.forEach(function (el) {
					if (description == "") {
						description += "\\▶" + el.info.title;
					}
					else {
						description += "\n" + el.info.title;
					}
				})
				const embed = new Discord.RichEmbed()
				.setColor(0x00FFFF)
				.setTitle("Queue")
				.setDescription(description);
				msg.channel.send({embed});
			}
			else {
				const embed = new Discord.RichEmbed()
				.setColor(0xFF0000)
				.setTitle("Uh Oh! Music is not currently playing!");
				msg.channel.send({embed});
			}
		},
		"bio": "Returns list of songs in queue",
		"syntax": "queue"
	},
	"skip": {
		"response": function(bot, msg, args) {
			if (isMusicAdminRole(msg.member) == true) {
				var queue = musicDisp[msg.guild.id + "_musicdispatcher"];
				if (queue && queue['disp']) {
					const embed = new Discord.RichEmbed()
					.setColor(0x00FFFF)
					.setTitle("Song Skipped!");
					msg.channel.send({embed});
					queue['disp'].end();
				}
				else {
					const embed = new Discord.RichEmbed()
					.setColor(0xFF0000)
					.setTitle("Uh Oh! Music is not currently playing!");
					msg.channel.send({embed});
				}
			}
			else {
				const embed = new Discord.RichEmbed()
				.setColor(0xFF0000)
				.setTitle("Uh Oh! Looks like you don't have permission to use this command!");
				msg.channel.send({embed});
			}
		},
		"bio": "Skips current song",
		"syntax": "skip"
	},
	"currentsong": {
		"response": function(bot, msg, args) {
			var queue = musicDisp[msg.guild.id + "_musicdispatcher"];
			if (queue && queue['disp']) {
				const embed = new Discord.RichEmbed()
				.setColor(0x00FFFF)
				.setTitle(queue['songs'][0].info.title);
				msg.channel.send({embed});
			}
			else {
				const embed = new Discord.RichEmbed()
				.setColor(0xFF0000)
				.setTitle("Uh Oh! Music is not currently playing!");
				msg.channel.send({embed});
			}
		},
		"bio": "Returns current playing song",
		"syntax": "currentsong"
	},
	"seek": {
		"response": function(bot, msg, args) {
			if (isMusicAdminRole(msg.member) == true) {
				var queue = musicDisp[msg.guild.id + "_musicdispatcher"];
				if (queue && queue['disp']) {
					var firstsong = queue['songs'][0];
					queue['songs'].unshift(firstsong);
					var timeinseconds = parseInt(args);
					queue['options'] = { position: timeinseconds, volume: queue['disp'].volume };
					queue['disp'].end();
				}
				else {
					const embed = new Discord.RichEmbed()
					.setColor(0xFF0000)
					.setTitle("Uh Oh! Music is not currently playing!");
					msg.channel.send({embed});
				}
			}
			else {
				const embed = new Discord.RichEmbed()
				.setColor(0xFF0000)
				.setTitle("Uh Oh! Looks like you don't have permission to use this command!");
				msg.channel.send({embed});
			}
		},
		"bio": "Seeks current song",
		"syntax": "seek <place to seek to *in seconds*>"
	},
	"volume": {
		"response": function(bot, msg, args) {
			if (isMusicAdminRole(msg.member) == true) {
				var queue = musicDisp[msg.guild.id + "_musicdispatcher"];
				if (queue && queue['disp']) {
					if (args) {
						var volumeint = parseInt(args);
						if (!isNaN(volumeint)) {
							queue['disp'].setVolume(volumeint/5);
							const embed = new Discord.RichEmbed()
							.setColor(0x00FFFF)
							.setTitle("Volume set to " + volumeint + "/10");
							msg.channel.send({embed});
						}
						else {
							const embed = new Discord.RichEmbed()
							.setColor(0xFF0000)
							.setTitle("Uh Oh! Please give a valid volume!");
							msg.channel.send({embed});
						}
					}
					else {
						const embed = new Discord.RichEmbed()
						.setColor(0x00FFFF)
						.setTitle("Volume is " + (queue['disp'].volume*5) + "/10");
						msg.channel.send({embed});
					}
				}
				else {
					const embed = new Discord.RichEmbed()
					.setColor(0xFF0000)
					.setTitle("Uh Oh! Music is not currently playing!");
					msg.channel.send({embed});
				}
			}
			else {
				const embed = new Discord.RichEmbed()
				.setColor(0xFF0000)
				.setTitle("Uh Oh! Looks like you don't have permission to use this command!");
				msg.channel.send({embed});
			}
		},
		"bio": "Sets volume from 1 to 10 or checks volume",
		"syntax": "volume [volume]"
	},
	"setmusicadminrole": {
		"response": function (bot, msg, args) {
			if (isAdminRole(msg.member) == true) {
				if (args) {
					role = msg.guild.roles.find(function(el) {
						return el.name == args;
					});;
					if (role == null) {
						const embed = new Discord.RichEmbed()
						.setColor(0xFF0000)
						.setTitle("Uh Oh! Please give a valid role!");
						msg.channel.send({embed});
					}
					else {
						storage.setItemSync(msg.guild.id + "_musicadminroleid", role.id);
						const embed = new Discord.RichEmbed()
						.setColor(0x00FFFF)
						.setTitle("Music Admin Role Set to " + role.name + "!");
						msg.channel.send({embed});
					}
				}
				else {
					storage.removeItemSync(msg.guild.id + "_musicadminroleid")
					const embed = new Discord.RichEmbed()
					.setColor(0x00FFFF)
					.setTitle("Music Admin Role Reset!");
					msg.channel.send({embed});
				}
			}
			else {
				const embed = new Discord.RichEmbed()
				.setColor(0xFF0000)
				.setTitle("Uh Oh! Looks like you don't have permission to use this command!");
				msg.channel.send({embed});
			}
		},
		"bio": "Sets Music Admin Role. Leaving the role name blank will reset your set music admin role. This command allows users with the role to control music command. If none is set, everyone is allowed to use the music commands.*(ADMIN COMMAND)*",
		"syntax": "setadminrole <rolename>"
	},
	"pause": {
		"response": function(bot, msg, args) {
			if (isMusicAdminRole(msg.member) == true) {
				var queue = musicDisp[msg.guild.id + "_musicdispatcher"];
				if (queue && queue['disp']) {
					queue['disp'].pause();
					const embed = new Discord.RichEmbed()
					.setColor(0x00FFFF)
					.setTitle("Player Paused!");
					msg.channel.send({embed});
				}
				else {
					const embed = new Discord.RichEmbed()
					.setColor(0xFF0000)
					.setTitle("Uh Oh! Music is not currently playing!");
					msg.channel.send({embed});
				}
			}
			else {
				const embed = new Discord.RichEmbed()
				.setColor(0xFF0000)
				.setTitle("Uh Oh! Looks like you don't have permission to use this command!");
				msg.channel.send({embed});
			}
		},
		"bio": "Pauses the player",
		"syntax": "pause"
	},
	"resume": {
		"response": function(bot, msg, args) {
			if (isMusicAdminRole(msg.member) == true) {
				var queue = musicDisp[msg.guild.id + "_musicdispatcher"];
				if (queue && queue['disp']) {
					queue['disp'].resume();
					const embed = new Discord.RichEmbed()
					.setColor(0x00FFFF)
					.setTitle("Player Resumed!");
					msg.channel.send({embed});
				}
				else {
					const embed = new Discord.RichEmbed()
					.setColor(0xFF0000)
					.setTitle("Uh Oh! Music is not currently playing!");
					msg.channel.send({embed});
				}
			}
			else {
				const embed = new Discord.RichEmbed()
				.setColor(0xFF0000)
				.setTitle("Uh Oh! Looks like you don't have permission to use this command!");
				msg.channel.send({embed});
			}
		},
		"bio": "Resumes the player",
		"syntax": "resume"
	},
	"morse": {
		"response": function(bot, msg, args) {
			if (args) {
				var string = "";
				var array = args.trim().split("");
				array.forEach(function (el) {
					var letter = morse[el.toLowerCase()];
					string += letter + "  ";
				});
				msg.channel.send(string, {split:true});
			}
			else {
				const embed = new Discord.RichEmbed()
				.setColor(0xFF0000)
				.setTitle("Uh Oh! Please give something to morse!");
				msg.channel.send({embed});
			}
		},
		"bio": "Turns your message to morse code",
		"syntax": "morse <something to say>"
	},
}

function spamWordEvent() {
	var callback = function (msg) {
		if (msg.guild) {
			if (msg.content.toLowerCase() == storage.getItemSync(msg.guild.id + "_spamword")) {
				var value = storage.getItemSync(msg.guild.id + "_spamcurrentcounter");
				value++;
				storage.setItemSync(msg.guild.id + "_spamcurrentcounter", value);
				if (value == storage.getItemSync(msg.guild.id + "_spamgoal")) {
					msg.reply("You Have Won!");
					storage.removeItemSync(msg.guild.id + "_spamword");
					storage.removeItemSync(msg.guild.id + "_spamgoal");
					storage.removeItemSync(msg.guild.id + "_spamcurrentcounter");
					storage.setItemSync(msg.author.id + msg.guild.id + "_eventactive", false);
				}
			}
		}
	};
	bot.once("spamcanceled", function () {
		storage.setItemSync(msg.guild.id + "_eventactive", false);
		bot.removeListener('message', callback);
		return;
	});
	bot.on("message", callback);
}

function parseArguments(args, argumentcount) {
	var words = args.split(" ");
	var out = words.splice(0, argumentcount - 1);
	var last = words.join(" ");
	out.push(last);
	return out;
}

function isMusicAdminRole(messageauthor) {
	var musicadminroleid = storage.getItemSync(messageauthor.guild.id + "_musicadminroleid");
	if (musicadminroleid) {
		if (messageauthor.roles.get(musicadminroleid)) {
			return true;
		}
		else if (messageauthor.id == messageauthor.guild.ownerID) {
				return true;
		} else {
				return false;
		}
	}
	else {
		return true;
	}
}

function isAdminRole(messageauthor) {
	var adminrole = messageauthor.roles.get(storage.getItemSync(messageauthor.guild.id + "_adminroleid"));
	if (adminrole) {
		if (adminrole.id == storage.getItemSync(messageauthor.guild.id + "_adminroleid")) {
			return true;
		}
	}
	else if (messageauthor.id == messageauthor.guild.ownerID) {
			return true;
	} else {
			return false;
	}
}

function getHelpDescription () {
	var desc = "";
	var descarray = [];
	for (var c in commands) {
		if (commands.hasOwnProperty(c)) {
			desc += "***"+ prefix + c + "*** - " + commands[c].bio + "\n";
			descarray.push("***"+ prefix + c + "*** - " + commands[c].bio + "\n");
		}
	}
	return descarray;
}

function playSong (queue, connection, stream) {
	var disp = connection.playStream(stream, queue['options']);
	queue['disp'] = disp;
	var volumecurrent = disp.volume;
	disp.once("end", function (arg) {
		queue['disp'] = null;
		queue['songs'].shift();
		var pos = 0;
		if (queue['options']['position']) {
			pos = queue['options']['position'];
		}
		queue['options'] = { seek: pos, volume: volumecurrent };
		playNextSong(queue, connection.channel);
	});
}

function playNextSong (queue, voicechannel) {
	if (queue['songs'].length == 0) {
		delete musicDisp[voicechannel.guild.id + "_musicdispatcher"];
		voicechannel.leave();
		return;
	}
	var nextSong = queue['songs'][0];
	var stream = ytdl(nextSong.link, {filter: "audioonly"});
	if (!voicechannel.connection) 	{
		voicechannel.join().then(connection => {
			connection.on('error', (err) => {
				console.log('connection error caught', err);
			});
			playSong(queue, connection, stream);
		}, reason => {
			console.log('Promise reject', reason);
		});
	}
	else {
		playSong(queue, voicechannel.connection, stream);
	}
}

bot.on("ready", () => {
	//console.log("Shard " + bot.shard.id + " Ready!");
	bot.user.setGame('with fire | ' + prefix + 'help');
	storage.init();
	cleverbot.create(function (err, cleverbotreferee) {
		if (err) {
			console.log("Cleverbot Start Error: " + err);
		}
	});
});

bot.on("guildMemberAdd", (member) => {
	//autorole
	var rolearray = storage.getItemSync(member.guild.id + "_autorole");
	if (rolearray) {
		rolearray.forEach(function (el) {
			try {
				member.addRole(el).then(
					function (u) {
					},
					function (reason) {
					}
				);
			}
			catch (e) {
			}
		});
	}
	//welcome message
	var welcomemessage = storage.getItemSync(member.guild.id + "_welcomemessage");
	if (welcomemessage != "") {
		var welcomechannel = member.guild.channels.get(storage.getItemSync(member.guild.id + "_welcomechannel"));
		if (welcomechannel) {
			var newwelcome = welcomemessage.replace("{Mention}", "<@" + member.id + ">");
			welcomechannel.send(newwelcome);
		}
	}
});
bot.on("guildMemberRemove", (member) => {
	var leavemessage = storage.getItemSync(member.guild.id + "_leavemessage");
	if (leavemessage != "") {
		var leavechannel = member.guild.channels.get(storage.getItemSync(member.guild.id + "_leavechannel"));
		if (leavechannel) {
			leavechannel.send(leavemessage);
		}
	}
});
bot.on("guildCreate", (guild) => {
	snekfetch.post(`https://discordbots.org/api/bots/289194076258172928/stats`)
    .send({server_count: bot.guilds.size})
    .set('Authorization', token.discordbotsorg)
    .then(console.log('Updated discordbots.org stats. Added ' + guild.name));
	guild.defaultChannel.send("hi i'm referee and i got some fun tricks up my sleeve \nDo ()help for help or look at my full documentation here: https://github.com/redgey/referee/blob/master/README.md");
	if (!guild.me.hasPermission("EMBED_LINKS")) {
		guild.defaultChannel.send("It seems that I don't have the Embed Links permission. I need this for most of my commands to work properly. If I do not respond to a command, it may because of this.");
	}
});
bot.on("guildDelete", (guild) => {
	snekfetch.post(`https://discordbots.org/api/bots/289194076258172928/stats`)
    .send({server_count: bot.guilds.size})
    .set('Authorization', token.discordbotsorg)
    .then(console.log('Updated discordbots.org stats. Removed ' + guild.name));
});


//command reply code
bot.on("message", msg => {
	if(msg.guild) {
		var thistriviamodule = triviamoduleobjects[msg.guild.id + "_triviamodule"];
	}
	// score
	if (msg.guild && msg.guild.available) {
		if (!msg.author.bot) {
			var score = storage.getItemSync(msg.author.id + msg.guild.id + "_score");
			if (!score) {
				score = 0;
			}
			score += 1;
			storage.setItem(msg.author.id + msg.guild.id + "_score", score);
		}
	}

	// process !
	if (msg.guild && msg.guild.available) {
		var customprefix = storage.getItemSync(msg.guild.id + "_prefix");
	}
	if (!customprefix) {
		customprefix = prefix;
	}
	if (msg.content.startsWith(customprefix)) {
		if (msg.guild && msg.guild.available) {
			var commandWithArgs = msg.content.substring(customprefix.length);
			var ind = commandWithArgs.indexOf(" ");
			var command = (ind >= 0) ? commandWithArgs.substring(0, ind) : commandWithArgs;
			var args = (ind >= 0) ? commandWithArgs.substring(ind + 1) : "";
			var channelarray = storage.getItemSync(msg.guild.id + "_disabledchannels");
			if (!channelarray) {
				channelarray = [];
			}
			if (!channelarray.includes(msg.channel.id) || command == "channeltoggle") {
				if (msg.author.id == redgeyId && command == "guilds") {
					var guilds = "";
					bot.guilds.forEach(function (el) {
						guilds += (el.name + "\n");
					});
					msg.reply(guilds, {split:true});
				}
				if (commands.hasOwnProperty(command)) {
					var commandreply = commands[command].response;
					console.log("[" + msg.createdAt + "] #" + msg.channel.name + " | " + msg.guild.name + " (" + msg.author.username + "#" + msg.author.discriminator + "): " + msg.content);
					log.info("#" + msg.channel.name + " | " + msg.guild.name + " (" + msg.author.username + "#" + msg.author.discriminator + "): " + msg.content);
					commandreply(bot, msg, args);
				}
				/*else if (command) {
					const embed = new Discord.RichEmbed()
					.setColor(0xFF0000)
					.setTitle("What's that? Unknown Command!");
					.setDescription("Do " + prefix + "help to get a list of available commands sent to your DMs.");
					msg.channel.send({embed});
				}*/
			}
		}
		else {
			const embed = new Discord.RichEmbed()
			.setColor(0xFF0000)
			.setTitle("Uh Oh! Commands don't work in DMs or Group DMs!");
			msg.channel.send({embed});
		}
	}
	else if(msg.content.startsWith("<@" + bot.user.id + ">") || msg.content.startsWith("<@!" + bot.user.id + ">")) {
		var channelarray = storage.getItemSync(msg.guild.id + "_disabledchannels");
		if (!channelarray) {
			channelarray = [];
		}
		var cleverbotdisabled = storage.getItemSync(msg.guild.id + "_cleverbotdisabled");
		if (!cleverbotdisabled) {
			cleverbotdisabled = false;
		}
		if (!channelarray.includes(msg.channel.id) && cleverbotdisabled == false) {
			var message = msg.content.replace("<@" + bot.user.id + ">", "");
			cleverbot.ask(message, function (err, response) {
  			msg.channel.send(":speech_balloon: " + response + " :speech_balloon:");
			});
		}
	}
	else if (msg.content && msg.content.length > 0 && thistriviamodule && thistriviamodule.isWaiting()) {
		thistriviamodule.checkAnswer(msg, storage, Discord);
	}
});

bot.login(token.token);

process.on("unhandledRejection", err => {
  console.error("Uncaught Promise Error: \n" + err.stack);
});
