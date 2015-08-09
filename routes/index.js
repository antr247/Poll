var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var PollModel = mongoose.model('PollModel');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// This method display all existing 
var refreshPollList = function() {
	router.get('/api/polls', function(req, res)
	{
		PollModel.find(function(err, pollData)
		{
			if(err)
				res.send(err);
			if(pollData)
				res.json(pollData);
		});

	});
};
refreshPollList();

exports.refreshPollList;
console.log(refreshPollList);

// This method display SINGLE poll
var displayMyPoll = function()
{
router.get('/api/polls/:poll_id', function(req, res)
{
		// "poll_id" above & below must match with same "poll_id" in 
		//.state('polldetail', { url: '/polldetail/:pollID',
		// templateUrl: '/partials/displaypoll.html',
		//otherwise will not display any individual poll even if hardcorde the
		//poll id (ex. var id = '5580dc3a4654ae140ba9fae3')
		var test2 = req.params.poll_id;
		console.log(test2);
		PollModel.findById({_id: req.params.poll_id}, function(err, poll)
		{
			var test1 = req.params.poll_id; 
			console.log(test1);
			console.log(test1);
			if(err)
				res.send(err);
			console.log(poll);
			if(poll)
				res.json(poll);
		});
});
}
displayMyPoll();

router.post('/api/polls/:poll_id/:poll_choice', function(req, res)
{
		// "poll_id" above & below must match with same "poll_id" in 
		//.state('polldetail', { url: '/polldetail/:pollID',
		// templateUrl: '/partials/displaypoll.html',
		//otherwise will not display any individual poll even if hardcorde the
		//poll id (ex. var id = '5580dc3a4654ae140ba9fae3')
		
		//'testpollid' has the md5 hash of the POLL user clicked to vote on
		var testpollid = req.params.poll_id;


		//'testpollchoiceid' has the md5 hash of the POLL CHOICE user clicked to vote on
		var testpollchoiceid = req.params.poll_choice;
		
		var ipCounter = 0;
		var ip ='tin';

		console.log('HERE IS testpollid CONTENT:');
		console.log(testpollid);
		console.log('HERE IS testpollchoiceid CONTENT:');
		console.log(testpollchoiceid);


		PollModel.findById({_id: req.params.poll_id}, function(err, poll)
		{
			if(poll)
			{
				/*
					Assign the Object of THE CHOICE user selected to 'choice' variable
					'choice' now has object of following:
					{ text: 'white', _id: 558338cc0d1f8c30128a82d7, votes: [] }

					Also 'poll.choices' below derived from
					<li ng-repeat="poll in pollData"> in View

					Also 'poll' in 'poll.choices.id' must match the one declared in above
					findById({_id: req.params.poll_id}, function(err, poll)
				*/

				var choice = poll.choices.id(testpollchoiceid);
				//choice.votes.push({ ip: ip });
							
				choice.votes.push({ ip: ip });

				console.log('HERE IS choice CONTENT:');
				console.log(choice);

				var ipCounter = ipCounter++;
				console.log('HERE IS ipCounter: ----------------------');
				console.log(ip);

				/*
					The program execute code top down and SKIP poll.save() 
				*/
				poll.save(function(err, doc)
				{
					if(err)
					{
						return (err);
					}
					else 
					{
						var theDoc = {
							question: doc.question, id: doc._id, choices: doc.choices,
							userVoted: false, totalVotes: 0
						};

						console.log('HERE IS theDoc #1 CONTENT:------------------');
						console.log(theDoc);

						/* 
							Loop through poll choices to COUNT the # of TIME EACH CHOICE IN
							THE EXISTING POLL already being voted. For example:
							Poll: Favorite drinks?
							1.Water 2.Soda 3.Beer
							where
							Water:(voted 7) - Soda:(voted 1) - Beer:(voted 3)
							will return
							11 as # of total COMBINED VOTED
						
						*/
						for(var i = 0, ln = doc.choices.length; i< ln; i++)
						{
							var choice = doc.choices[i];

							for(var j= 0, jLn = choice.votes.length; j< jLn; j++)
							{
								var vote = choice.votes[j];
								theDoc.totalVotes++;

								theDoc.ip = ip;
								console.log('HERE IS theDoc.ip CONTENT:------------------');
								console.log(theDoc.ip);

								console.log('HERE IS vote.ip CONTENT:------------------');
								console.log(vote.ip);

								console.log('HERE IS ip CONTENT:------------------');
								console.log(ip);


								if(vote.ip === ip)
								{
									theDoc.userVoted = true;
									theDoc.userChoice = { _id: choice._id, text: choice.text };
									console.log('Here is the value of theDoc.userChoice');
									console.log(theDoc.userChoice);
								}
							}
						}
						/*
							Differences between theDoc #2 & theDoc #1 are theDoc#2
							1) update 'totalVotes' with # of TOTAL COMBINED VOTE among choices in poll
							2) update 'userVoted' check flag to see if user voted or not on this poll
							3) insert 'ip' field with username of voter
							4) insert 'userChoice' OBJECT with user last vote choice
								userChoice: { _id: 5587ad060a9e110816f9f1a9, text: 'beer' } }
						*/
						console.log('HERE theDoc #2 CONTENT:--------');
						console.log(theDoc);

						console.log('HERE poll.userVoted CONTENT:--------');
						poll.userVoted = theDoc.userVoted;
						console.log(poll.userVoted);

						console.log('HERE poll CONTENT:--------');
						console.log(poll);

						console.log('HERE doc CONTENT:--------');
						console.log(doc);
					}
						console.log('HERE poll.userVoted #2 CONTENT:--------');
						console.log(poll.userVoted);						
				}); 
						/*
							The 'poll.userVoted' variable is UNDEFINED because
							program skip the save() above & jumped directly to
							here AND THEN come back to continue EXECUTING save() above!
						*/

						console.log('HERE poll.userVoted CONTENT:--------');
						console.log(poll.userVoted);

					console.log('HERE is json(poll) CONTENT:**************')
					console.log(poll);	
					return res.json(poll);
			}
			else 
			{
				return res.json({error:true});
			} 
		});
});


// This method to create new poll
var createPoll = function()
{
	router.post('/api/polls', function(req, res)
	{
		PollModel.create
		({
			question: req.body.question,
			choices: req.body.choices.filter(function(v) { return v.text != ''; }),
		}, function (err, pollChoices)
		{
			if(err)
				res.send(err);
			if(pollChoices)
				res.json(pollChoices);
		})
	});
};
createPoll();
exports.createPoll;

module.exports = router;
