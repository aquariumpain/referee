var utils = require('./utils.js');

(function(triviaModule) {

		var Trivia = function() {
			var questions = [
				{ question: 'How many feet are there in a fathom?', answer: '6', altanswer: 'six'},
				{ question: 'A phlebotomist extracts what from the human body?', answer: 'blood', altanswer: ''},
				{ question: 'In computers, what does RAM stand for?', answer: 'random access memory', altanswer: ''},
				{ question: 'In what year did Nintendo release its first game console in North America?', answer: '1985', altanswer: ''},
				{ question: 'Which planet in our solar system spins the fastest?', answer: 'jupiter', altanswer: ''},
				{ question: 'What is the second largest country by land mass?', answer: 'canada', altanswer: ''},
				{ question: 'What vitamin is produced when a person is exposed to sunlight?', answer: 'vitamin d', altanswer: 'd'},
				{ question: 'What city is the capital of Canada?', answer: 'ottawa', altanswer: ''},
				{ question: 'What is the tallest building in New York?', answer: 'one world trade center', altanswer: ''},
				{ question: 'Where would you find the Sea of Tranquility?', answer: 'moon', altanswer: 'the moon'},
				{ question: 'What is the spice called in Dune by Frank Herbert?', answer: 'melange', altanswer: ''},
				{ question: 'What is the answer to life, the universe, and everything?', answer: '42', altanswer: 'forty-two'},
				{ question: 'What is the unit of length that is approximately 3.26 light-years?', answer: 'parsec', altanswer: ''},
				{ question: "What was described as 'wrinkling' space-time in the book A Wrinkle in Time by Madeleine L'Engle?", answer: 'tessering', altanswer: 'tesser'},
				{ question: 'What was the name of the first U.S. space station?', answer: 'skylab', altanswer: ''},
				{ question: 'The opposite of Albinism is called?', answer: 'melanism', altanswer: ''},
				{ question: 'What is the largest 3-digit prime number?', answer: '997', altanswer: ''},
				{ question: 'In The Novel The Wonderful Wizard of Oz, Dorothy’s Magic Slippers Aren’t Ruby Red, But?', answer: 'silver', altanswer: ''},
				{ question: 'The tallest mountain in the Solar System is on which planet?', answer: 'mars', altanswer: ''},
				{ question: 'What is a group of lions called?', answer: 'a pride', altanswer: 'pride'},
				{ question: 'What is "...as hard as dragon scale and as light as a feather" in The Lord of the Rings?', answer : 'mithril', altanswer : ''},
				{ question: 'The four parts of an EGOT are an Emmy, Grammy, Oscar, and ...', answer: 'tony', altanswer: 'a tony'},
				//{ question: '', answer: '', altanswer: ''},
			];
			var completedquestions = [];
			var triviachannel = null;
			var trivialeaderboard = [];
			var timeout;

		this.askQuestion = function(Discord) {
			var question;
			do {
				question = utils.getRandomIntInclusive(0, (questions.length-1));
			}
			while (completedquestions.includes(question));
			triviachannel.sendMessage(questions[question].question);
			completedquestions.push(question);
			var outsidethis = this;
			console.log(question);
			timeout  = setTimeout(function() {
				var embed = new Discord.RichEmbed();
				embed.setColor(0x00FFFF);
				embed.setTitle("No one got it! The answer was " + questions[question].answer + "! Next Question!");
				triviachannel.sendEmbed(embed);
				outsidethis.askQuestion(Discord);
			}, 20*1000);
		};

		this.checkAnswer = function(msg, storage, Discord) {
			if (msg.channel.id == triviachannel.id) {
				var question = completedquestions[completedquestions.length-1];
				var result = msg.content.toLowerCase() == questions[question].answer || msg.content.toLowerCase() == questions[question].altanswer;
				if (result) {
					msg.reply("has the right answer. It was " + questions[question].answer);
					var points = trivialeaderboard.find(function(el) {
						return el.usernamediscrim == msg.author.username+"#"+msg.author.discriminator;
					});
					if (points == undefined) {
						trivialeaderboard.push({ usernamediscrim : msg.author.username + "#" + msg.author.discriminator, score : 1 });
					}
					else {
						var point = trivialeaderboard.find(function(el) {
							return el.usernamediscrim == msg.author.username+"#"+msg.author.discriminator;
						});
						point.score++;
					}
					if (completedquestions.length >= /*change this number to change amount of questions asked in trivia*/ questions.length) {
						this.displayLeaderboard(msg.guild);
						this.resetTrivia(storage, msg, triviachannel);
					}
					else {
						clearTimeout(timeout);
						this.askQuestion(Discord);
					}
				}
			}
		};

		this.isWaiting = function() {
			return completedquestions.length > 0;
		};

		this.displayLeaderboard = function(guild) {
			for (var src = 0; src < trivialeaderboard.length; src++) {
				// try to bubble up
				for (var dst = src - 1; dst >= 0; dst--) {
					if (trivialeaderboard[src].score > trivialeaderboard[dst].score) {
						// swap
						var tmp = trivialeaderboard[dst];
						trivialeaderboard[dst] = trivialeaderboard[src];
						trivialeaderboard[src] = tmp;
						src--;
					}
				}
			}
			var count = Math.min(10, trivialeaderboard.length);
			var leaderboardoutput = "";
			for (var i = 0; i < count; i++) {
				leaderboardoutput += (i+1) + ". " + trivialeaderboard[i].usernamediscrim + " \n \t Score: " + trivialeaderboard[i].score + "\n";
			}
			guild.defaultChannel.sendMessage(":clipboard: **" + guild.name + "'s Trivia Leaderboard**\n```" + leaderboardoutput + "```");
			trivialeaderboard.length = 0;
		};

		this.resetTrivia = function(storage, msg, tchannel) {
			completedquestions.length = 0;
			storage.setItemSync(msg.guild.id + "_eventactive", false);
			tchannel.sendMessage("Trivia Complete! This channel will now be deleted.");
			if (tchannel) {
				setTimeout(function() {
					tchannel.delete();
				}, 5000);
			}
		};


		this.triviaStart = function(tchannel, Discord, storage, bot) {
				var embed = new Discord.RichEmbed();
				triviachannel = tchannel;
				embed.setColor(0x00FFFF);
				embed.setTitle("Trivia Event Started");
				triviachannel.sendEmbed(embed);
				this.askQuestion(Discord);
			};

		};

	triviaModule.create = function () {
		return new Trivia();
	};

}(module.exports));
