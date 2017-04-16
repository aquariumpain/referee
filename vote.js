(function(voteModule) {

		var Vote = function() {
      var options;
      var topic;
      var votescore = [];

  		this.addVote = function(votenumber) {
  			var option = votescore[votenumber - 1];
        if (option) {
          var newoption = { choice : option.choice, votes : option.votes + 1};
          votescore[votenumber - 1] = newoption;
        }
  		};

  		this.getVotes = function() {
        var newvotesscore = votescore;
        newvotesscore.unshift(topic);
        return newvotesscore;
  		};

  		this.startVote = function(topicinput, optionarray) {
				options = optionarray;
        topic = topicinput;
        options.forEach(function (el) {
          votescore.push({ choice : el, votes : 0});
        });
  		};

		};

	voteModule.create = function () {
		return new Vote();
	};

}(module.exports));
