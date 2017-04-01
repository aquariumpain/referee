const Discord = require("discord.js");
const storage = require('node-persist');
const bot = new Discord.Client();
const triviamodule = require('./trivia.js');
const utils = require('./utils.js');
const token = require('token.js');

var prefix = "!";
var currentspammedwords;
var spamword;
var spamgoal;
var triviachannel;
var commands = {
	"ping": {
		"response": function(bot, msg) {
			var embed = new Discord.RichEmbed();
			embed.setColor(0x00FF00);
			embed.setTitle("Pong! Your ping is " + bot.ping + "ms")
			msg.channel.sendEmbed(embed);
		},
		"bio": "Returns average ping \n Usage: " + prefix + "ping"
	},
	"say": {
		"response": function(bot, msg, args) {
			msg.channel.sendMessage(args);
		},
		"bio": "Makes referee say something \n Usage: " + prefix + "say <text>"
	},
	"help": {
		"response": function(bot, msg) {
			var helparray = getHelpDescription();
			for (var i = 0; i < helparray.length; i += 10) {
				var joined = helparray.slice(i, (i+10));
				var embed = new Discord.RichEmbed();
				embed.setColor(0x00FF00);
				embed.setTitle("Available referee Commands");
				embed.setDescription(joined);
				msg.author.sendEmbed(embed);
			}
			//msg.author.sendMessage("```" + getHelpDescription() + "```");

			var embed2 = new Discord.RichEmbed();
			embed2.setColor(0x00FFFF);
			embed2.setTitle("A list of commands has been sent to your DMs");
			msg.channel.sendEmbed(embed2);
		},
		"bio": "Displays a list of commands \n Usage: " + prefix + "help"
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
		"bio": "Sets Admin Role. Leaving the role name blank will reset your set admin role. *(ADMIN COMMAND)* \n Usage: " + prefix + "setadminrole <rolename>"
	},
	"event": {
		"response": function(bot, msg, args) {
			arglist = parseArguments(args, 3);
			eventtype = arglist[0];
			arg1 = arglist[1];
			arg2 = arglist[2];
			if (eventtype.toLowerCase() == "cancel") {
				var triviachannel = msg.guild.channels.find(function(el) {
					return el.name == "trivia";
				});
				triviamodule.resetTrivia(storage, msg, triviachannel);
				var embed = new Discord.RichEmbed();
				embed.setColor(0xFF0000);
				embed.setTitle("Event Canceled");
				msg.channel.sendEmbed(embed);
			}
			else {
				if(isAdminRole(msg.member) == true) {
					if (!storage.getItemSync(msg.author.id + msg.guild.id + "_eventactive")) {
						if (eventtype.toLowerCase() == "trivia") {
							storage.setItemSync(msg.author.id + msg.guild.id + "_eventactive", true);
							msg.guild.createChannel("trivia", "text").then( function() {
								triviachannel = msg.guild.channels.find(function(el) {
									return el.name == "trivia";
								});
								triviamodule.triviaEvent(triviachannel, Discord, storage, bot);
							});
						}
						else if (eventtype.toLowerCase() == "spam") {
							if (!isNaN(arg2)) {
								storage.setItemSync(msg.author.id + msg.guild.id + "_eventactive", true);
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
			}
		},
		"bio": "Starts an event. [WIP] *(ADMIN COMMAND)* \n Available Events: Trivia, Spam \n Usage: " + prefix + "event <event> [arg1] [arg2]"
	},
	"rate": {
		"response": function(bot, msg, args) {
			if (args) {
				var embed = new Discord.RichEmbed();
				embed.setColor(0x00FF00);
				embed.setTitle(msg.author.username + ", I rate " + args + " a " + utils.getRandomIntInclusive(0,10) + "/10")
				msg.channel.sendEmbed(embed);
			}
			else {
				var embed = new Discord.RichEmbed();
				embed.setColor(0xFF0000);
				embed.setTitle("Uh Oh! Please give something to rate!");
				msg.channel.sendEmbed(embed);
			}
		},
		"bio": "Rates something \n Usage: !rate <something to rate>"
	},
	"score": {
		"response": function(bot, msg) {
			if (storage.getItemSync(msg.author.id + msg.guild.id + "_score")) {
				var embed = new Discord.RichEmbed();
				embed.setColor(0x00FF00);
				embed.setTitle("Your score is " + storage.getItemSync(msg.author.id + msg.guild.id + "_score") + "!");
				msg.channel.sendEmbed(embed);
			}
			else {
				var embed = new Discord.RichEmbed();
				embed.setColor(0x00FF00);
				embed.setTitle("Uh Oh! Looks like you don't have a score. Talk in the channels to get points!");
				msg.channel.sendEmbed(embed);
			}
		},
		"bio": "Returns your score \n Usage: " + prefix + "score"
	},
	"clearscore": {
		"response": function(bot, msg, args) {
			var embed = new Discord.RichEmbed();
			storage.removeItem(msg.author.id + msg.guild.id + "_score");
			embed.setColor(0x00FF00);
			embed.setTitle(msg.author.username + "'s score has been reset");
			msg.channel.sendEmbed(embed);
		},
		"bio": "Clears your balance \n Usage: " + prefix + "clearscore"
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
		"bio": "Clears all scores *(ADMIN COMMAND)* \n Usage: " + prefix + "clearallscores"
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
		"bio": "Displays a leaderboard for this server \n Usage: " + prefix + "leaderboard"
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
		"bio": "Adds an amount to your balance \n Usage: " + prefix + "add <amount>"
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
				msg.channel.sendEmbed(embed);
			}
		},
		"bio": "Checks your balance \n Usage: " + prefix + "value"
	},
	"clearvalue": {
		"response": function(bot, msg, args) {
			var embed = new Discord.RichEmbed();
			storage.removeItem(msg.member.id + msg.guild.id + "_money");
			embed.setColor(0x00FF00);
			embed.setTitle(msg.author.username + "'s value has been reset");
			msg.channel.sendEmbed(embed);
		},
		"bio": "Clears your balance \n Usage: " + prefix + "clearvalue"
	},
	"dice": {
		"response": function(bot, msg, args) {
			var embed = new Discord.RichEmbed();
			embed.setColor(0xFFFFFF);
			embed.setTitle(":game_die: " + utils.getRandomIntInclusive(1, 6) + " :game_die:");
			msg.channel.sendEmbed(embed);
		},
		"bio": "Rolls dice \n Usage: " + prefix + "dice"
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
					embed.setAuthor(msg.author.username, msg.author.avatarURL);
				}
			}
			msg.channel.sendEmbed(embed);
		},
		"bio": "Plays slots \n Usage: " + prefix + "slots <bet>"
	},
	"addgetrole": {
		"response": function(bot, msg, args) {
			if(isAdminRole(msg.member) == true) {
				var roletoadd = msg.guild.roles.find(function(el) {
					return el.name == args;
				});
				var availableroles = [];
				var currentavailableroles = storage.getItemSync(msg.guild.id + "_availablegetroles");
				if (!currentavailableroles) {
					currentavailableroles = [];
				}
				availableroles = currentavailableroles;
				availableroles.push({ roleid: roletoadd.id, rolename: roletoadd.name, role: roletoadd});
				storage.setItemSync(msg.guild.id + "_availablegetroles", availableroles);
				var embed = new Discord.RichEmbed();
				embed.setColor(0x00FF00);
				embed.setTitle("Role " + roletoadd.name + " added as an available role for the getrole command!");
				msg.channel.sendEmbed(embed);
			}
			else {
				var embed = new Discord.RichEmbed();
				embed.setColor(0xFF0000);
				embed.setTitle("Uh Oh! Looks like you don't have permission to use this command!");
				msg.channel.sendEmbed(embed);
			}
		},
		"bio": "Adds a role to the getrole command *(ADMIN COMMAND)* ***MAKE SURE THAT THE referee ROLE IS HIGHER THAN THE GETROLE ROLE***\n Usage: " + prefix + "addgetrole <role>"
	},
	"getrole": {
		"response": function(bot, msg, args) {
			var roletoadd = msg.guild.roles.find(function(el) {
				return el.name == args;
			});
			if (roletoadd) {
				var availableroles = storage.getItemSync(msg.guild.id + "_availablegetroles");
				var gettable = availableroles.find(function(el) {
					return el.roleid == roletoadd.id;
				});
				if (gettable) {
					msg.member.addRole(roletoadd);
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
		"bio": "Gets you a role if it is available \n Usage: " + prefix + "getrole <role>"
	},
	"autorole": {
		"response": function(bot, msg, args) {
			if(isAdminRole(msg.member) == true) {
				if (args) {
					var roletoadd = msg.guild.roles.find(function(el) {
						return el.name == args;
					});
					if (roletoadd) {
						storage.setItemSync(msg.guild.id + "_autorole", roletoadd.id);
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
				else {
					if (storage.getItemSync(msg.guild.id + "_autorole")) {
						storage.removeItemSync(msg.guild.id + "_autorole");
						var embed = new Discord.RichEmbed();
						embed.setColor(0x00FF00);
						embed.setTitle("Autorole Reset!");
						msg.channel.sendEmbed(embed);
					}
				}
			}
			else {
				var embed = new Discord.RichEmbed();
				embed.setColor(0xFF0000);
				embed.setTitle("Uh Oh! Looks like you don't have permission to use this command!");
				msg.channel.sendEmbed(embed);
			}
		},
		"bio": "Automatically assigns this role when a user joins the server. Leaving the role blank will reset your current set role. *(ADMIN COMMAND)* ***MAKE SURE THAT THE referee ROLE IS HIGHER THAN THE AUTOROLE ROLE***\n Usage: " + prefix + "autorole <role to add automatically>"
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
		"bio": "Sets an welcome or leave message. Leaving the message blank will clear your set message. *(ADMIN COMMAND)* \n Usage: " + prefix + "announce <welcome|leave> <message>"
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
			msg.channel.sendEmbed(embed);
		},
		"bio": "Gives basic server info \n Usage: " + prefix + "serverinfo"
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
				msg.channel.sendEmbed(embed);
				}
			}
		},
		"bio": "Displays the avatar of a user (in this server) or self if no user is given \n Usage: " + prefix + "avatar exampleuser#1234, " + prefix + "avatar @exampleuser#1234, or " + prefix + "avatar"
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
			msg.channel.sendEmbed(embed);
			}
		},
		"bio": "Displays info about a user (in this server) or self if no user is given \n Usage: " + prefix + "userinfo exampleuser#1234, " + prefix + "userinfo @exampleuser#1234, or " + prefix + "userinfo"
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
			msg.channel.sendEmbed(embed);
		},
		"bio": "Gives basic bot info \n Usage: " + prefix + "stats"
	},
	"ban": {
		"response": function(bot, msg, args) {
			if(isAdminRole(msg.member) == true) {
				var arglist = parseArguments(args, 2);
				var arg1 = arglist[0];
				var arg2 = arglist[1];
				var mentionuser = msg.mentions.users.first();
				member = msg.guild.members.find(function(el) {
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
				embed.setTitle("Uh Oh! Looks like you don't have permission to use this command!");
				msg.channel.sendEmbed(embed);
			}
		},
		"bio": "Bans a user *(ADMIN COMMAND)* \n Usage: " + prefix + "ban @user#1234 <how many days worth of messages to delete *(optional)*>"
	},
	"purge": {
		"response": function(bot, msg, args) {
			if(isAdminRole(msg.member) == true) {
				if (!isNaN(args)) {
					msg.channel.bulkDelete(args);
				}
			}
			else {
				var embed = new Discord.RichEmbed();
				embed.setColor(0xFF0000);
				embed.setTitle("Uh Oh! Looks like you don't have permission to use this command!");
				msg.channel.sendEmbed(embed);
			}
		},
		"bio": "Deletes a large amount of messages *(ADMIN COMMAND)* \n Usage: " + prefix + "purge <amount>"
	},
	"prefix": {
		"response": function(bot, msg, args) {
			if(isAdminRole(msg.member) == true) {
				if (args) {
					storage.setItemSync(msg.guild.id + "_prefix", args);
					var embed = new Discord.RichEmbed();
					embed.setColor(0x00FFFF);
					embed.setTitle("Prefix set to " + args);
					msg.channel.sendEmbed(embed);
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
		"bio": "Sets a new prefix for your server *(ADMIN COMMAND)* \n Usage: " + prefix + "prefix <new prefix>"
	},
	"embed": {
		"response": function(bot, msg, args) {
			var embed = new Discord.RichEmbed();
			embed.setColor(0x7B68EE);
			embed.setAuthor(msg.author.username, msg.author.avatarURL);
			embed.setDescription(args);
			msg.channel.sendEmbed(embed);
		},
		"bio": "Puts text in a nice embed \n Usage: " + prefix + "embed <text>"
	}/*,
	"softban": {
		"response": function(bot, msg, args) {
			if(isAdminRole(msg.member) == true) {
				var arglist = parseArguments(args, 3);
				var arg1 = arglist[0];
				var arg2 = arglist[1];
				var arg3 = arglist[2];
				console.log(arg1 + '--' + arg2 + '--' + arg3)
				var user = msg.mentions.users.first();
				var guilduser = msg.guild.members.find(function (el) {
				return el.id == user.id;
				});
				var reinvite = arg2.toLowerCase() == "true";
				console.log(reinvite);
				guilduser.ban(user.id)
				.then(function (bannedUser) {
				   console.log('Success =======', bannedUser);
				})
				.catch(function (reason) {
				   console.log('Failure =======', reason);
				});
				if (arg1 && isNaN(arg1) == false) {
				if (guilduser) {
				guilduser.ban(user.id)
				.then(function (bannedUser) {
				//bannedUser.sendMessage("You have been banned from " + msg.guild.name);
				setTimeout(function () {
				msg.guild.unban(bannedUser.id)
				       .then(function (unbannedUser) {
				           if (reinvite == true) {
				               msg.guild.defaultChannel.createInvite()
				               .then((invite) => {
				                   var url = invite.url;
				                   console.log(url);
				                   unbannedUser.sendMessage(url);
				               })
				               .catch ((reason) => {
				                   //console.log(reason);
				               });
				           }
				       });
				}, (arg1 * 1000));
			});
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
					embed.setTitle("Uh Oh! Please give a vaild time!");
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
		"bio": "Temporarily bans a user *(ADMIN COMMAND)* \n Usage: " + prefix + "softban <duration of ban in seconds> <whether to resend an invite link when ban is complete - true|false> @user#1234"
	}*/
}

function spamWordEvent() {
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
	} else if (messageauthor.user.username + "#" + messageauthor.user.discriminator == "redgey#9352") {
			return true
	} else if (messageauthor.id == messageauthor.guild.ownerID) {
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
			desc += "***"+ prefix + c + "*** - " + commands[c].bio + "\n\n";
			descarray.push("***"+ prefix + c + "*** - " + commands[c].bio + "\n\n");
		}
	}
	return descarray;
}


bot.on("ready", () => {
	bot.user.setGame('with your mind | ' + prefix + 'help');
	storage.init();
});

bot.on("guildMemberAdd", (member) => {
	//autorole
	var autoroleid = storage.getItemSync(member.guild.id + "_autorole");
	if (autoroleid) {
		try {
			member.addRole(autoroleid).then(
				function (u) {
				},
				function (reason) {
				}
			);
		}
		catch (e) {
		}
	}
	//welcome message
	var welcomemessage = storage.getItemSync(member.guild.id + "_welcomemessage");
	if (welcomemessage != "") {
		var welcomechannel = member.guild.channels.get(storage.getItemSync(member.guild.id + "_welcomechannel"));
		if (welcomechannel) {
			welcomechannel.sendMessage(welcomemessage);
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

			if (commands.hasOwnProperty(command)) {
				var commandreply = commands[command].response;
				commandreply(bot, msg, args);
			}
			else if (command) {
				var embed = new Discord.RichEmbed();
				embed.setColor(0xFF0000);
				embed.setTitle("What's that? Unknown Command!");
				embed.setDescription("Do !help to get a list of available commands sent to your DMs.");
				msg.channel.sendEmbed(embed);
			}
		}
		else {
			var embed = new Discord.RichEmbed();
			embed.setColor(0xFF0000);
			embed.setTitle("Uh Oh! Commands don't work in DMs or Group DMs!");
			msg.channel.sendEmbed(embed);
		}
	}
	else if (msg.content && msg.content.length > 0 && triviamodule.isWaiting()) {
		triviamodule.checkAnswer(msg, storage);
	}
});

bot.login(token.token);
