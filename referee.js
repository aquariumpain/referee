const Discord = require("discord.js");
const storage = require('node-persist');
const bot = new Discord.Client();
const trivia = require('./trivia.js');
const utils = require('./utils.js');
const token = require('./token.js');
const votemodule = require('./vote.js');
const cleverbotio = require('cleverbot.io');
const cleverbot = new cleverbotio("HPQImwt7XorKOzyu", "eTJuxJjdy0NptJ9xV2VfRo7Pi2i3Kqj9");
cleverbot.setNick("cleverbotreferee");

var prefix = "()";
var refereeserverlink = "https://discord.gg/CncfjgM";
var refereeinvitelink = "https://discordapp.com/oauth2/authorize?client_id=289194076258172928&scope=bot&permissions=2146696319";
var currentspammedwords;
var spamword;
var spamgoal;
var triviamoduleobjects = {};
var voteobjects = {};
var votedusers = [];
var commands = {
	"ping": {
		"response": function(bot, msg) {
			var embed = new Discord.RichEmbed();
			embed.setColor(0x00FF00);
			embed.setTitle("Pong! Your ping is " + bot.ping + "ms");
			//embed.setFooter("referee-Shard " + bot.shard.id, "https://cdn.discordapp.com/avatars/289194076258172928/b0c96ffd7f8d65e88550afe8fc288e35.jpg?size=1024");
			msg.channel.sendEmbed(embed);
		},
		"bio": "Returns average ping",
		"syntax": "ping"
	},
	"say": {
		"response": function(bot, msg, args) {
			if (args) {
				msg.channel.sendMessage(args);
			}
			else {
				var embed = new Discord.RichEmbed();
				embed.setColor(0xFF0000);
				embed.setTitle("Uh Oh! Please give something to say!");
				msg.channel.sendEmbed(embed);
			}
		},
		"bio": "Makes referee say something",
		"syntax": "say <something to say>"
	},
	"help": {
		"response": function(bot, msg, args) {
			if (!args) {
				var embed3 = new Discord.RichEmbed();
				embed3.setColor(0x00FFFF);
				embed3.addField("Default referee Prefix", "`" + prefix + "`", false);
				var serverprefix = storage.getItemSync(msg.guild.id + "_prefix");
				if (serverprefix) {
					embed3.addField(msg.guild.name + "'s Custom Prefix", "`" + serverprefix + "`", false);
				}
				embed3.addField("Join the Official referee server", refereeserverlink, false);
				embed3.addField("Invite referee to your server", refereeinvitelink, false);
				//embed3.setFooter("referee-Shard " + bot.shard.id, "https://cdn.discordapp.com/avatars/289194076258172928/b0c96ffd7f8d65e88550afe8fc288e35.jpg?size=1024");
				msg.author.sendEmbed(embed3);
				var helparray = getHelpDescription();
				for (var i = 0; i < helparray.length; i += 15) {
					var joined = helparray.slice(i, (i+15));

					var embed = new Discord.RichEmbed();
					embed.setColor(0x00FFFF);
					embed.setTitle("Available referee Commands");
					embed.setDescription(joined);
					//embed.setFooter("referee-Shard " + bot.shard.id, "https://cdn.discordapp.com/avatars/289194076258172928/b0c96ffd7f8d65e88550afe8fc288e35.jpg?size=1024");
					msg.author.sendEmbed(embed);
				}
				var embed2 = new Discord.RichEmbed();
				embed2.setColor(0x00FFFF);
				embed2.setTitle("A list of commands has been sent to your DMs");
				//embed.setFooter("referee-Shard " + bot.shard.id, "https://cdn.discordapp.com/avatars/289194076258172928/b0c96ffd7f8d65e88550afe8fc288e35.jpg?size=1024");
				msg.channel.sendEmbed(embed2);
			}
			else {
				var command = commands[args];
				if (command) {
					var serverprefix = storage.getItemSync(msg.guild.id + "_prefix");
					if (!serverprefix) {
						serverprefix = prefix;
					}
					var embed = new Discord.RichEmbed();
					embed.setColor(0x00FFFF);
					embed.addField(prefix + args + " - " + command.bio, "Usage: " + serverprefix + command.syntax, false);
					//embed.setFooter("referee-Shard " + bot.shard.id, "https://cdn.discordapp.com/avatars/289194076258172928/b0c96ffd7f8d65e88550afe8fc288e35.jpg?size=1024");
					msg.channel.sendEmbed(embed);
				}
				else {
					var embed = new Discord.RichEmbed();
					embed.setColor(0xFF0000);
					embed.setTitle("Uh Oh! Please give a valid command!");
					msg.channel.sendEmbed(embed);
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
						var embed = new Discord.RichEmbed();
						embed.setColor(0xFF0000);
						embed.setTitle("Uh Oh! Please give a valid role!");
						msg.channel.sendEmbed(embed);
					}
					else {
						storage.setItemSync(msg.guild.id + "_adminroleid", role.id);
						var embed = new Discord.RichEmbed();
						embed.setColor(0x00FFFF);
						embed.setTitle("Admin Role Set to " + role.name + "!");
						msg.channel.sendEmbed(embed);
					}
				}
				else {
					storage.removeItemSync(msg.guild.id + "_adminroleid")
					var embed = new Discord.RichEmbed();
					embed.setColor(0x00FFFF);
					embed.setTitle("Admin Role Reset!");
					msg.channel.sendEmbed(embed);
				}
			}
			else {
				var embed = new Discord.RichEmbed();
				embed.setColor(0xFF0000);
				embed.setTitle("Uh Oh! Looks like you don't have permission to use this command!");
				msg.channel.sendEmbed(embed);
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
						storage.setItemSync(msg.guild.id + "_eventactive", true);
						msg.guild.createChannel("trivia", "text").then( function(el) {
							var thistriviamodule = new trivia.create();
							triviamoduleobjects[msg.guild.id + "_triviamodule"] = thistriviamodule;
							var triviachannel = el;
							thistriviamodule.triviaStart(triviachannel, Discord, storage, bot);
						});
					}
					else if (eventtype.toLowerCase() == "spam") {
						if (!isNaN(arg2)) {
							storage.setItemSync(msg.guild.id + "_eventactive", true);
							storage.setItemSync(msg.guild.id + "_spamword", arg1);
							storage.setItemSync(msg.guild.id + "_spamgoal", arg2);
							storage.setItemSync(msg.guild.id + "_spamcurrentcounter", 0);
							spamWordEvent();
							var embed = new Discord.RichEmbed();
							embed.setColor(0x00FFFF);
							embed.setTitle("Spam Event Started. The word is " + arg1 + "!");
							msg.channel.sendEmbed(embed);
						}
						else {
							var embed = new Discord.RichEmbed();
							embed.setColor(0xFF0000);
							embed.setTitle("Uh Oh! Please give a valid number of words to spam!");
							msg.channel.sendEmbed(embed);
						}
					}
					else {
						var embed = new Discord.RichEmbed();
						embed.setColor(0xFF0000);
						embed.setTitle("Uh Oh! Please give a valid event type such as Trivia or Spam!");
						msg.channel.sendEmbed(embed);
					}
				}
				else if (eventtype.toLowerCase() == "cancel") {
					var triviachannel = msg.guild.channels.find(function(el) {
						return el.name == "trivia";
					});
					var thistriviamodule = triviamoduleobjects[msg.guild.id + "_triviamodule"];
					thistriviamodule.resetTrivia(storage, msg, triviachannel);
					//storage.setItemSync(msg.guild.id + "_eventactive", false);
					bot.emit('spamcanceled');
					var embed = new Discord.RichEmbed();
					embed.setColor(0xFF0000);
					embed.setTitle("Event Canceled");
					msg.channel.sendEmbed(embed);
				}
				else {
					var embed = new Discord.RichEmbed();
					embed.setColor(0xFF0000);
					embed.setTitle("Uh Oh! Looks like there's already an event in progress!");
					msg.channel.sendEmbed(embed);
				}
			}
			else {
				var embed = new Discord.RichEmbed();
				embed.setColor(0xFF0000);
				embed.setTitle("Uh Oh! Looks like you don't have permission to use this command!");
				msg.channel.sendEmbed(embed);
			}
		},
		"bio": "Starts an event. *(ADMIN COMMAND)* \n Available Events: Trivia, Spam",
		"syntax": "event <event name|cancel> [arg1] [arg2]"
	},
	"rate": {
		"response": function(bot, msg, args) {
			if (args) {
				var text = args;
				if (text.length < 200) {
					var embed = new Discord.RichEmbed();
					embed.setColor(0x00FF00);
					embed.setTitle(msg.author.username + ", I rate " + args + " a " + utils.getRandomIntInclusive(0,10) + "/10");
					//embed.setFooter("referee-Shard " + bot.shard.id, "https://cdn.discordapp.com/avatars/289194076258172928/b0c96ffd7f8d65e88550afe8fc288e35.jpg?size=1024");
					msg.channel.sendEmbed(embed);
				}
				else {
					var embed = new Discord.RichEmbed();
					embed.setColor(0xFF0000);
					embed.setTitle("Uh Oh! How do I rate something I can't even say!?!");
					msg.channel.sendEmbed(embed);
				}
			}
			else {
				var embed = new Discord.RichEmbed();
				embed.setColor(0xFF0000);
				embed.setTitle("Uh Oh! Please give something to rate!");
				msg.channel.sendEmbed(embed);
			}
		},
		"bio": "Rates something",
		"syntax": "rate <something to rate>"
	},
	"score": {
		"response": function(bot, msg) {
			if (storage.getItemSync(msg.author.id + msg.guild.id + "_score")) {
				var embed = new Discord.RichEmbed();
				embed.setColor(0x00FF00);
				embed.setTitle("Your score is " + storage.getItemSync(msg.author.id + msg.guild.id + "_score") + "!");
				//embed.setFooter("referee-Shard " + bot.shard.id, "https://cdn.discordapp.com/avatars/289194076258172928/b0c96ffd7f8d65e88550afe8fc288e35.jpg?size=1024");
				msg.channel.sendEmbed(embed);
			}
			else {
				var embed = new Discord.RichEmbed();
				embed.setColor(0x00FF00);
				embed.setTitle("Uh Oh! Looks like you don't have a score. Talk in the channels to get points!");
				msg.channel.sendEmbed(embed);
			}
		},
		"bio": "Returns your score",
		"syntax": "score"
	},
	"clearscore": {
		"response": function(bot, msg, args) {
			var embed = new Discord.RichEmbed();
			storage.removeItem(msg.author.id + msg.guild.id + "_score");
			embed.setColor(0x00FF00);
			embed.setTitle(msg.author.username + "'s score has been reset");
			msg.channel.sendEmbed(embed);
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
				var embed = new Discord.RichEmbed();
				embed.setColor(0x00FF00);
				embed.setTitle("All Scores Cleared!");
				msg.channel.sendEmbed(embed);
			}
			else {
				var embed = new Discord.RichEmbed();
				embed.setColor(0xFF0000);
				embed.setTitle("Uh Oh! Looks like you don't have permission to use this command!");
				msg.channel.sendEmbed(embed);
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
			msg.channel.sendMessage(":clipboard: **" + msg.guild.name + "'s Leaderboard**\n```" + leaderboardoutput + " \n ------------------------------------------------------ \n▶ Your Rank: " + (rank+1) + " - Your Score: " + storage.getItemSync(msg.author.id + msg.guild.id + "_score") + "  👀```");
		},
		"bio": "Displays a leaderboard for this server",
		"syntax": "leaderboard"
	},
	"add": {
		"response": function(bot, msg, args) {
			var embed = new Discord.RichEmbed();
			var amount = parseInt(args);
			if (isNaN(args) || args == "") {
				embed.setColor(0xFF0000);
				embed.setTitle("Uh Oh! Please give a valid amount!");
			}
			else {
				 	var value = storage.getItemSync(msg.member.id + msg.guild.id + "_money");
					if (!value) {
						value = 0;
					}
					value += amount;
					storage.setItem(msg.member.id + msg.guild.id + "_money", value);
					embed.setColor(0x00FF00);
					embed.setTitle("You now have " + value + ":moneybag:s");
			}
			msg.channel.sendEmbed(embed);
		},
		"bio": "Adds an amount to your balance",
		"syntax": "add <amount>"
	},
	"value": {
		"response": function(bot, msg, args) {
			var embed = new Discord.RichEmbed();
			if (storage.getItemSync(msg.member.id + msg.guild.id + "_money") == undefined || storage.getItemSync(msg.member.id + msg.guild.id + "_money") == 0) {
				embed.setColor(0x00FF00);
				embed.setTitle("Looks like you've got nothing in your account. Do $add <amount> to get some money");
				msg.channel.sendEmbed(embed);
			}
			else {
				embed.setColor(0x00FF00);
				embed.setTitle(msg.author.username + " has " + storage.getItemSync(msg.member.id + msg.guild.id + "_money") + ":moneybag:");
				//embed.setFooter("referee-Shard " + bot.shard.id, "https://cdn.discordapp.com/avatars/289194076258172928/b0c96ffd7f8d65e88550afe8fc288e35.jpg?size=1024");
				msg.channel.sendEmbed(embed);
			}
		},
		"bio": "Checks your balance",
		"syntax": "value"
	},
	"clearvalue": {
		"response": function(bot, msg, args) {
			var embed = new Discord.RichEmbed();
			storage.removeItem(msg.member.id + msg.guild.id + "_money");
			embed.setColor(0x00FF00);
			embed.setTitle(msg.author.username + "'s value has been reset");
			msg.channel.sendEmbed(embed);
		},
		"bio": "Clears your balance",
		"syntax": "clearvalue"
	},
	"dice": {
		"response": function(bot, msg, args) {
			var embed = new Discord.RichEmbed();
			embed.setColor(0xFFFFFF);
			embed.setTitle(":game_die: " + utils.getRandomIntInclusive(1, 6) + " :game_die:");
			//embed.setFooter("referee-Shard " + bot.shard.id, "https://cdn.discordapp.com/avatars/289194076258172928/b0c96ffd7f8d65e88550afe8fc288e35.jpg?size=1024");
			msg.channel.sendEmbed(embed);
		},
		"bio": "Rolls dice",
		"syntax": "dice"
	},
	"slots": {
		"response": function(bot, msg, args) {
			var embed = new Discord.RichEmbed();
			if (isNaN(args) || args == "") {
				embed.setColor(0xFF0000);
				embed.setTitle("Uh Oh! Please give a valid bet!");
			}
			else {
				var one = utils.getRandomIntInclusive(1,3);
				var two = utils.getRandomIntInclusive(1,3);
				var three = utils.getRandomIntInclusive(1,3);
				var bet = parseInt(args);
				if (storage.getItemSync(msg.member.id + msg.guild.id + "_money") < bet) {
					embed.setColor(0xFF0000);
					embed.setTitle("You can't play! You don't even have what you're betting! Do $add <amount> to get more money");
				}
				else {
					embed.setColor(0x00FF00);
					embed.setTitle("Slots");
					embed.setDescription(
					"-- " + (one-1) + " " + (two-1) + " " + (three-1) + " -- \n" +
					"**-- " + one + " " + two + " " + three + " --** \n" +
					"-- " + (one+1) + " " + (two+1) + " " + (three+1) +  " --");
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
					embed.addField("Result", winorloss, true);
					//embed.setFooter("referee-Shard " + bot.shard.id, "https://cdn.discordapp.com/avatars/289194076258172928/b0c96ffd7f8d65e88550afe8fc288e35.jpg?size=1024");
					embed.setAuthor(msg.author.username, msg.author.avatarURL);
				}
			}
			msg.channel.sendEmbed(embed);
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
							var embed = new Discord.RichEmbed();
							embed.setColor(0x00FF00);
							embed.setTitle("Role " + roletoadd.name + " added as an available role for the getrole command!");
							msg.channel.sendEmbed(embed);
						}
						else {
							var embed = new Discord.RichEmbed();
							embed.setColor(0xFF0000);
							embed.setTitle("Uh Oh! Please give a valid role!");
							msg.channel.sendEmbed(embed);
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
								}
								else {
									var embed = new Discord.RichEmbed();
									embed.setColor(0xFF0000);
									embed.setTitle("Uh Oh! This role is not set as an getrole!");
									msg.channel.sendEmbed(embed);
								}
							}
							else {
								var embed = new Discord.RichEmbed();
								embed.setColor(0xFF0000);
								embed.setTitle("Uh Oh! It looks like you don't have any getroles set!");
								msg.channel.sendEmbed(embed);
							}
						}
						else {
							var embed = new Discord.RichEmbed();
							embed.setColor(0xFF0000);
							embed.setTitle("Uh Oh! Please give a valid role!");
							msg.channel.sendEmbed(embed);
						}
					}
					else if (arg1 == "clear") {
						var rolearray = storage.getItemSync(msg.guild.id + "_availablegetroles");
						if (rolearray) {
							storage.removeItemSync(msg.guild.id + "_availablegetroles");
							var embed = new Discord.RichEmbed();
							embed.setColor(0x00FF00);
							embed.setTitle("Getroles Reset!");
							msg.channel.sendEmbed(embed);
						}
						else {
							var embed = new Discord.RichEmbed();
							embed.setColor(0xFF0000);
							embed.setTitle("Uh Oh! It looks like you don't have any getroles set!");
							msg.channel.sendEmbed(embed);
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
							var embed = new Discord.RichEmbed();
							embed.setColor(0x00FFFF);
							embed.setTitle("All GetRole Roles for " + msg.guild.name);
							embed.setDescription(rolelist);
							msg.channel.sendEmbed(embed);
						}
						else {
							var embed = new Discord.RichEmbed();
							embed.setColor(0xFF0000);
							embed.setTitle("Uh Oh! It looks like you don't have any getroles set!");
							msg.channel.sendEmbed(embed);
						}
					}
					else {
						var embed = new Discord.RichEmbed();
						embed.setColor(0xFF0000);
						embed.setTitle("Uh Oh! Please specify whether to add, remove, clear, or list getroles!");
						msg.channel.sendEmbed(embed);
					}

				}
				else {
					var embed = new Discord.RichEmbed();
					embed.setColor(0xFF0000);
					embed.setTitle("Uh Oh! Please give valid arguments!");
					msg.channel.sendEmbed(embed);
				}
			}
			else {
				var embed = new Discord.RichEmbed();
				embed.setColor(0xFF0000);
				embed.setTitle("Uh Oh! Looks like you don't have permission to use this command!");
				msg.channel.sendEmbed(embed);
			}
		},
		"bio": "Adds a role to the getrole command *(ADMIN COMMAND)* ***MAKE SURE THAT THE referee ROLE IS HIGHER THAN THE GETROLE ROLE***",
		"syntax": "addgetrole <role name>"
	},
	"getrole": {
		"response": function(bot, msg, args) {
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
					var embed = new Discord.RichEmbed();
					embed.setColor(0x00FF00);
					embed.setTitle("You have received the " + roletoadd.name + " role!");
					msg.channel.sendEmbed(embed);
				}
				else {
					var embed = new Discord.RichEmbed();
					embed.setColor(0xFF0000);
					embed.setTitle("Uh Oh! Please give a role that I can add!");
					msg.channel.sendEmbed(embed);
				}
			}
			else {
				var embed = new Discord.RichEmbed();
				embed.setColor(0xFF0000);
				embed.setTitle("Uh Oh! Please give a valid role!");
				msg.channel.sendEmbed(embed);
			}
		},
		"bio": "Gets you a role if it is available",
		"syntax": "getrole <role name>"
	},
	"autorole": {
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
							var rolearray = storage.getItemSync(msg.guild.id + "_autorole");
							if (!rolearray) {
								rolearray = [];
							}
							rolearray.push(roletoadd.id);
							storage.setItemSync(msg.guild.id + "_autorole", rolearray);
							var embed = new Discord.RichEmbed();
							embed.setColor(0x00FF00);
							embed.setTitle("The " + roletoadd.name + " role will now be added automatically when a user joins this server!");
							msg.channel.sendEmbed(embed);
						}
						else {
							var embed = new Discord.RichEmbed();
							embed.setColor(0xFF0000);
							embed.setTitle("Uh Oh! Please give a valid role!");
							msg.channel.sendEmbed(embed);
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
								}
								else {
									var embed = new Discord.RichEmbed();
									embed.setColor(0xFF0000);
									embed.setTitle("Uh Oh! This role is not set as an autorole!");
									msg.channel.sendEmbed(embed);
								}
							}
							else {
								var embed = new Discord.RichEmbed();
								embed.setColor(0xFF0000);
								embed.setTitle("Uh Oh! It looks like you don't have any autoroles set!");
								msg.channel.sendEmbed(embed);
							}
						}
						else {
							var embed = new Discord.RichEmbed();
							embed.setColor(0xFF0000);
							embed.setTitle("Uh Oh! Please give a valid role!");
							msg.channel.sendEmbed(embed);
						}
					}
					else if (arg1 == "clear") {
						var rolearray = storage.getItemSync(msg.guild.id + "_autorole");
						if (rolearray) {
							storage.removeItemSync(msg.guild.id + "_autorole");
							var embed = new Discord.RichEmbed();
							embed.setColor(0x00FF00);
							embed.setTitle("Autoroles Reset!");
							msg.channel.sendEmbed(embed);
						}
						else {
							var embed = new Discord.RichEmbed();
							embed.setColor(0xFF0000);
							embed.setTitle("Uh Oh! It looks like you don't have any autoroles set!");
							msg.channel.sendEmbed(embed);
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
							var embed = new Discord.RichEmbed();
							embed.setColor(0x00FFFF);
							embed.setTitle("All Autorole Roles for " + msg.guild.name);
							embed.setDescription(rolelist);
							msg.channel.sendEmbed(embed);
						}
						else {
							var embed = new Discord.RichEmbed();
							embed.setColor(0xFF0000);
							embed.setTitle("Uh Oh! It looks like you don't have any autoroles set!");
							msg.channel.sendEmbed(embed);
						}
					}
					else {
						var embed = new Discord.RichEmbed();
						embed.setColor(0xFF0000);
						embed.setTitle("Uh Oh! Please specify whether to add, remove, clear, or list autoroles!");
						msg.channel.sendEmbed(embed);
					}

				}
				else {
					var embed = new Discord.RichEmbed();
					embed.setColor(0xFF0000);
					embed.setTitle("Uh Oh! Please give valid arguments!");
					msg.channel.sendEmbed(embed);
				}
			}
			else {
				var embed = new Discord.RichEmbed();
				embed.setColor(0xFF0000);
				embed.setTitle("Uh Oh! Looks like you don't have permission to use this command!");
				msg.channel.sendEmbed(embed);
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
				var embed = new Discord.RichEmbed();
				if (arg1 == "welcome") {
					if (arg2) {
						storage.setItemSync(msg.guild.id + "_welcomemessage", message);
						storage.setItemSync(msg.guild.id + "_welcomechannel", msg.channel.id);
						embed.setColor(0x00FFFF);
						embed.setTitle("Welcome Message Set!");
					}
					else {
						storage.removeItemSync(msg.guild.id + "_welcomemessage");
						storage.removeItemSync(msg.guild.id + "_welcomechannel");
						embed.setColor(0x00FFFF);
						embed.setTitle("Welcome Message Reset!");
					}
				}
				else if (arg1 == "leave") {
					if (arg2) {
						storage.setItemSync(msg.guild.id + "_leavemessage", message);
						storage.setItemSync(msg.guild.id + "_leavechannel", msg.channel.id);
						embed.setColor(0x00FFFF);
						embed.setTitle("Leave Message Set!");
					}
					else {
						storage.removeItemSync(msg.guild.id + "_leavemessage");
						storage.removeItemSync(msg.guild.id + "_leavechannel");
						embed.setColor(0x00FFFF);
						embed.setTitle("Leave Message Reset!");
					}
				}
				else {
					var embed = new Discord.RichEmbed();
					embed.setColor(0xFF0000);
					embed.setTitle("Uh Oh! Please give a valid announce type such as welcome or leave!");
				}
				msg.channel.sendEmbed(embed);
			}
			else {
				var embed = new Discord.RichEmbed();
				embed.setColor(0xFF0000);
				embed.setTitle("Uh Oh! Looks like you don't have permission to use this command!");
				msg.channel.sendEmbed(embed);
			}
		},
		"bio": "Sets an welcome or leave message. Leaving the message blank will clear your set message. Including {Mention} in the message mentions the user that joined. *(ADMIN COMMAND)*",
		"syntax": "announce <welcome|leave> <message>"
	},
	"serverinfo": {
		"response": function(bot, msg, args) {
			var embed = new Discord.RichEmbed();
			embed.setColor(0xFF00FF);
			embed.addField("Name", msg.guild.name, true);
			embed.addField("Owner", msg.guild.owner.user.username + "#" + msg.guild.owner.user.discriminator, true);
			embed.setThumbnail(msg.guild.iconURL);
			embed.addField("Channels", msg.guild.channels.size, true);
			embed.addField("Members", msg.guild.memberCount, true);
			embed.addField("Created", msg.guild.createdAt, true);
			embed.addField("ID", msg.guild.id, true);
			embed.setAuthor(msg.author.username, msg.author.avatarURL);
			//embed.setFooter("referee-Shard " + bot.shard.id, "https://cdn.discordapp.com/avatars/289194076258172928/b0c96ffd7f8d65e88550afe8fc288e35.jpg?size=1024");
			msg.channel.sendEmbed(embed);
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
			var embed = new Discord.RichEmbed();
			if (member == null) {
				embed.setColor(0xFF0000);
				embed.setTitle("Uh Oh! I can't find the user you're looking for!");
				msg.channel.sendEmbed(embed);
			}
			else {
				if (member.avatarURL == null) {
					embed.setColor(0xFF0000);
					embed.setTitle("Uh Oh! It looks like you don't have a set avatar!");
					msg.channel.sendEmbed(embed);
				}
				else {
				embed.setColor(0x0000FF);
				embed.setTitle(member.username + "'s avatar. Here's a link: " + member.avatarURL);
				embed.setImage(member.avatarURL);
				//embed.setFooter("referee-Shard " + bot.shard.id, "https://cdn.discordapp.com/avatars/289194076258172928/b0c96ffd7f8d65e88550afe8fc288e35.jpg?size=1024");
				msg.channel.sendEmbed(embed);
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
			var embed = new Discord.RichEmbed();
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
				embed.setColor(0xFF0000);
				embed.setTitle("Uh Oh! I can't find the user you're looking for!");
				msg.channel.sendEmbed(embed);
			}
			else {
			embed.setColor(0x00FA9A);
			embed.addField("Name", member.username, true);
			embed.addField("Discriminator", member.discriminator, true);
			embed.addField("ID", member.id, true);
			embed.addField("Joined", member.createdAt, true);
			embed.setThumbnail(member.avatarURL);
			embed.setAuthor(msg.author.username, msg.author.avatarURL);
			//embed.setFooter("referee-Shard " + bot.shard.id, "https://cdn.discordapp.com/avatars/289194076258172928/b0c96ffd7f8d65e88550afe8fc288e35.jpg?size=1024");
			msg.channel.sendEmbed(embed);
			}
		},
		"bio": "Displays info about a user (in this server) or self if no user is given",
		"syntax": "userinfo <exampleuser#1234 | @exampleuser#1234>"
	},
	"stats": {
		"response": function(bot, msg, args) {
			var embed = new Discord.RichEmbed();
			embed.setTitle("Bot Stats");
			embed.setColor(0xFF00FF);
			embed.addField("Name", bot.user.username, true);
			embed.addField("Owner", "redgey#9352", true);
			embed.setThumbnail(bot.user.avatarURL);
			embed.addField("Total Guilds", bot.guilds.size, true);
			embed.addField("Total Members", bot.users.size, true);
			embed.addField("Total Channels", bot.channels.size, true);
			embed.addField("Library", "discord.js", true);
			//embed.setFooter("referee-Shard " + bot.shard.id, "https://cdn.discordapp.com/avatars/289194076258172928/b0c96ffd7f8d65e88550afe8fc288e35.jpg?size=1024");
			msg.channel.sendEmbed(embed);
		},
		"bio": "Gives basic bot info",
		"syntax": "stats"
	},
	"ban": {
		"response": function(bot, msg, args) {
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
					var embed = new Discord.RichEmbed();
					embed.setColor(0xFF0000);
					embed.setTitle(mentionuser.username + " Banned!");
					msg.channel.sendEmbed(embed);
				}
				else {
					var embed = new Discord.RichEmbed();
					embed.setColor(0xFF0000);
					embed.setTitle("Uh Oh! Please give a valid user!");
					msg.channel.sendEmbed(embed);
				}
				}

			else {
				var embed = new Discord.RichEmbed();
				embed.setColor(0xFF0000);
				embed.setTitle("Uh Oh! Looks like you don't have permission to use this command!");
				msg.channel.sendEmbed(embed);
			}
		},
		"bio": "Bans a user *(ADMIN COMMAND)*",
		"syntax": "ban @user#1234 <how many days worth of messages to delete *(optional)*>"
	},
	"purge": {
		"response": function(bot, msg, args) {
			if(isAdminRole(msg.member) == true) {
				if (!isNaN(args)) {
					var argamounttodelete = parseInt(args);
					var recentmessages = msg.channel.messages;
					var amounttodelete = (recentmessages.length < argamounttodelete) ? recentmessages.length : argamounttodelete;
					msg.channel.bulkDelete(amounttodelete + 1).catch(console.error);
				}
				else {
					var embed = new Discord.RichEmbed();
					embed.setColor(0xFF0000);
					embed.setTitle("Uh Oh! Please give a valid amount of messages to delete!");
					msg.channel.sendEmbed(embed);
				}
			}
			else {
				var embed = new Discord.RichEmbed();
				embed.setColor(0xFF0000);
				embed.setTitle("Uh Oh! Looks like you don't have permission to use this command!");
				msg.channel.sendEmbed(embed);
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
						var embed = new Discord.RichEmbed();
						embed.setColor(0x00FFFF);
						embed.setTitle("Prefix set to `" + args + "`");
						msg.channel.sendEmbed(embed);
					}
					else {
						var embed = new Discord.RichEmbed();
						embed.setColor(0xFF0000);
						embed.setTitle("Uh Oh! Please set a prefix shorter than 20 characters!");
						msg.channel.sendEmbed(embed);
					}
				}
				else {
					storage.removeItemSync(msg.guild.id + "_prefix");
					var embed = new Discord.RichEmbed();
					embed.setColor(0x00FFFF);
					embed.setTitle("Current set prefix has been reset!");
					msg.channel.sendEmbed(embed);
				}
			}
			else {
				var embed = new Discord.RichEmbed();
				embed.setColor(0xFF0000);
				embed.setTitle("Uh Oh! Looks like you don't have permission to use this command!");
				msg.channel.sendEmbed(embed);
			}
		},
		"bio": "Sets a new prefix for your server *(ADMIN COMMAND)*",
		"syntax": "prefix <new prefix>"
	},
	"embed": {
		"response": function(bot, msg, args) {
			if (args) {
				if (args.length < 200) {
					var embed = new Discord.RichEmbed();
					embed.setColor(0x7B68EE);
					embed.setAuthor(msg.author.username, msg.author.avatarURL);
					embed.setDescription(args);
					//embed.setFooter("referee-Shard " + bot.shard.id, "https://cdn.discordapp.com/avatars/289194076258172928/b0c96ffd7f8d65e88550afe8fc288e35.jpg?size=1024");
					msg.channel.sendEmbed(embed);
				}
				else {
					var embed = new Discord.RichEmbed();
					embed.setColor(0xFF0000);
					embed.setTitle("Uh Oh! How do I embed something I can't even say!?!");
					msg.channel.sendEmbed(embed);
				}
			}
			else {
				var embed = new Discord.RichEmbed();
				embed.setColor(0xFF0000);
				embed.setTitle("Uh Oh! Please give something to embed!");
				msg.channel.sendEmbed(embed);
			}
		},
		"bio": "Puts text in a nice embed",
		"syntax": "embed <text>"
	},
	"invite": {
		"response": function(bot, msg, args) {
			msg.channel.sendMessage(refereeinvitelink);
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
						var embed = new Discord.RichEmbed();
						embed.setColor(0x00FFFF);
						embed.setTitle("Commands are now enabled for this channel!");
						msg.channel.sendEmbed(embed);
					}
				}
				else {
					channelarray.push(msg.channel.id);
					var embed = new Discord.RichEmbed();
					embed.setColor(0x00FFFF);
					embed.setTitle("Commands are now disabled for this channel!");
					msg.channel.sendEmbed(embed);
					storage.setItemSync(msg.guild.id + "_disabledchannels", channelarray);
				}
			}
			else {
				var embed = new Discord.RichEmbed();
				embed.setColor(0xFF0000);
				embed.setTitle("Uh Oh! Looks like you don't have permission to use this command!");
				msg.channel.sendEmbed(embed);
			}
		},
		"bio": "Toggles commands in that channel *(ADMIN COMMAND)*",
		"syntax": "channeltoggle"
	},
	"coin": {
		"response": function(bot, msg, args) {
			var hort = utils.getRandomIntInclusive(1, 2) == 1 ? "Heads" : "Tails";
			var embed = new Discord.RichEmbed();
			embed.setColor(0xFFFFFF);
			embed.setTitle(hort);
			//embed.setFooter("referee-Shard " + bot.shard.id, "https://cdn.discordapp.com/avatars/289194076258172928/b0c96ffd7f8d65e88550afe8fc288e35.jpg?size=1024");
			msg.channel.sendEmbed(embed);
		},
		"bio": "Flips coin",
		"syntax": "coin"
	},
	"choose": {
		"response": function(bot, msg, args) {
			var arglist = args.split(",");
			if (arglist) {
				var number = utils.getRandomIntInclusive(0, (arglist.length-1));
				var embed = new Discord.RichEmbed();
				embed.setColor(0xFFFFFF);
				embed.setTitle(arglist[number]);
				//embed.setFooter("referee-Shard " + bot.shard.id, "https://cdn.discordapp.com/avatars/289194076258172928/b0c96ffd7f8d65e88550afe8fc288e35.jpg?size=1024");
				msg.channel.sendEmbed(embed);
			}
			else {
				var embed = new Discord.RichEmbed();
				embed.setColor(0xFF0000);
				embed.setTitle("Uh Oh! Please give something to choose!");
				msg.channel.sendEmbed(embed);
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
				var embed = new Discord.RichEmbed();
				embed.setColor(0xFFFFFF);
				embed.setTitle("Hmm... \n" + answers[number]);
				//embed.setFooter("referee-Shard " + bot.shard.id, "https://cdn.discordapp.com/avatars/289194076258172928/b0c96ffd7f8d65e88550afe8fc288e35.jpg?size=1024");
				msg.channel.sendEmbed(embed);
			}
			else {
				var embed = new Discord.RichEmbed();
				embed.setColor(0xFF0000);
				embed.setTitle("Uh Oh! Please ask the 8ball a question!");
				msg.channel.sendEmbed(embed);
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
						msg.channel.sendMessage(resultmessage + "```");
					}
					else {
						var embed = new Discord.RichEmbed();
						embed.setColor(0xFF0000);
						embed.setTitle("Uh Oh! Please give valid options!");
						msg.channel.sendEmbed(embed);
					}
				}
				else {
					var embed = new Discord.RichEmbed();
					embed.setColor(0xFF0000);
					embed.setTitle("Uh Oh! There is already a vote in progress!");
					msg.channel.sendEmbed(embed);
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
				msg.channel.sendMessage(resultmessage + "```");
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
						msg.channel.sendMessage(resultmessage + "```");
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
					var embed = new Discord.RichEmbed();
					embed.setColor(0xFF0000);
					embed.setTitle("Uh Oh! There is no vote currently in progress!");
					msg.channel.sendEmbed(embed);
				}
			}
			else if (arg1 && !isNaN(arg1)) {
				if (!votedusers.includes(msg.guild.id + "_" + msg.author.id)) {
					var thisvote = voteobjects[msg.guild.id + "_votemodule"];
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
						msg.channel.sendMessage(resultmessage + "```");
					}
					else {
						var embed = new Discord.RichEmbed();
						embed.setColor(0xFF0000);
						embed.setTitle("Uh Oh! Please give a valid vote!");
						msg.channel.sendEmbed(embed);
					}
				}
				else {
					var embed = new Discord.RichEmbed();
					embed.setColor(0xFF0000);
					embed.setTitle("Uh Oh! You've already voted!");
					msg.channel.sendEmbed(embed);
				}
			}
			else {
				var embed = new Discord.RichEmbed();
				embed.setColor(0xFF0000);
				embed.setTitle("Uh Oh! Please give a valid option such as start, check, end, or an option you are voting for!");
				msg.channel.sendEmbed(embed);
			}
		},
		"bio": "Voting",
		"syntax": "vote <start|check|end> [vote topic; option 1; option 2; option 3; ...]"
	},
	"cleverbottoggle": {
		"response": function(bot, msg, args) {
			if(isAdminRole(msg.member) == true) {
				var cleverbotdisabledcurrent = storage.getItemSync(msg.guild.id + "_cleverbotdisabled");
				if (!cleverbotstatuscurrent) {
					cleverbotdisabledcurrent = false;
				}
				if (cleverbotdisabledcurrent = false) {
					storage.setItemSync(msg.guild.id + "_cleverbotdisabled", true);
					var embed = new Discord.RichEmbed();
					embed.setColor(0x00FFFF);
					embed.setTitle("Cleverbot is now disabled for this server!");
					msg.channel.sendEmbed(embed);
				}
				else {
					storage.removeItemSync(msg.guild.id + "_cleverbotdisabled");
					var embed = new Discord.RichEmbed();
					embed.setColor(0x00FFFF);
					embed.setTitle("Cleverbot is now enabled for this server!");
					msg.channel.sendEmbed(embed);
				}
			}
			else {
				var embed = new Discord.RichEmbed();
				embed.setColor(0xFF0000);
				embed.setTitle("Uh Oh! Looks like you don't have permission to use this command!");
				msg.channel.sendEmbed(embed);
			}
		},
		"bio": "Toggles clever in that server *(ADMIN COMMAND)*. To use cleverbot, just mention referee in the start of your message",
		"syntax": "cleverbottoggle"
	}
}

function spamWordEvent() {
	bot.once("spamcanceled", function () {
		storage.setItemSync(msg.guild.id + "_eventactive", false);
		return;
	});
	bot.on("message", msg => {
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
	});
}

function parseArguments(args, argumentcount) {
	var words = args.split(" ");
	var out = words.splice(0, argumentcount - 1);
	var last = words.join(" ");
	out.push(last);
	return out;
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
			welcomechannel.sendMessage(newwelcome);
		}
	}
});
bot.on("guildMemberRemove", (member) => {
	var leavemessage = storage.getItemSync(member.guild.id + "_leavemessage");
	if (leavemessage != "") {
		var leavechannel = member.guild.channels.get(storage.getItemSync(member.guild.id + "_leavechannel"));
		if (leavechannel) {
			leavechannel.sendMessage(leavemessage);
		}
	}
});

bot.on("guildCreate", (guild) => {
	guild.defaultChannel.sendMessage("hi i'm referee and i got some fun tricks up my sleeve")
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
				if (commands.hasOwnProperty(command)) {
					var commandreply = commands[command].response;
					commandreply(bot, msg, args);
				}
				else if (command) {
					var embed = new Discord.RichEmbed();
					embed.setColor(0xFF0000);
					embed.setTitle("What's that? Unknown Command!");
					embed.setDescription("Do " + prefix + "help to get a list of available commands sent to your DMs.");
					msg.channel.sendEmbed(embed);
				}
			}
		}
		else {
			var embed = new Discord.RichEmbed();
			embed.setColor(0xFF0000);
			embed.setTitle("Uh Oh! Commands don't work in DMs or Group DMs!");
			msg.channel.sendEmbed(embed);
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
  			msg.channel.sendMessage(":speech_balloon: " + response + " :speech_balloon:");
			});
		}
	}
	else if (msg.content && msg.content.length > 0 && thistriviamodule && thistriviamodule.isWaiting()) {
		thistriviamodule.checkAnswer(msg, storage, Discord);
	}
});

bot.login(token.token);
