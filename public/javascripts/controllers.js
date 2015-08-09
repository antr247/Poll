var AppCtrl = angular.module('AppCtrl', ['ui.router']);

// Main Controoler displayy all current polls
function mainController($scope, $http, $stateParams, $state)
{
	//$scope.polls = {};

	$http.get('/api/polls/')
		.success(function (data) {
			$scope.pollData = data;
		})
		.error(function(data) {
			console.log('Error: ' + data);
		})
};


// Controller to display individual poll and their choices
function DisplayPollCtrl($scope, $http, $state, $stateParams)
{
	/*
		Create a 'polls' variable with $scope attribute to glue
		DisplayPollCtrl with the view/displaypoll.html

		Also, $scope.polls also tie to the  voteNow() below when
		user vote choice radio button being declared with
		ng-model="polls.userVote"
		pollChoiceSelected = $scope.polls.userVote;

		Therefore, 'polls' in $scope.polls.userVote MUST MATCH
		with same 'polls' declared below $scope.polls
	*/
	$scope.polls = {};
	/*
		pollID = $stateParams.id will parse the 'id' in the URL 
		http://localhost:3000/#/polldetail/558338cc0d1f8c30128a82d3
		and assign "558338cc0d1f8c30128a82d3" to pollID
		BUT 'id' in $stateParams.id MUST MATCH the 'id' declared after
		the colon (:) in route config in order for $tateParams to parse
		correctly!!!
		url: '/polldetail/:id',
		templateUrl: '/partials/displaypoll.html',

		Also REFRESH THE PAGE on Poll Display page is still working
		because the $http.get is still getting the CORRECT POLL 'id'
		from the URL through $stateParams parsing method.
	*/
	var pollID = $stateParams.id;
	console.log(pollID);

	$http.get('/api/polls/' + pollID)
		.success(function (data) {
			console.log(data);
			$scope.poll = data;
			$scope.totalVotes = $scope.poll.__v;
			/*
				'poll' is object contain the information about the poll.
				And we extract totalVotes from the object 'poll' by assigning
				'poll.__v' of 'poll' to '$scope.totalVotes' so view can display
				it in string.
				Object {_id: "5587ad060a9e110816f9f1a8", question: "drink?", __v: 14, choices: Array[3]}
			*/
		})
		.error(function(data) {
			console.log('Error: ' + data);
		})

	$scope.voteNow = function()
	{
		var pollSelected = $scope.poll._id,
			pollChoiceSelected = $scope.polls.userVote;

		console.log(pollSelected);
		console.log(pollChoiceSelected);
		if(pollChoiceSelected)
		{
			var voteObj = { poll_id: pollSelected, choice: pollChoiceSelected };
			$scope.votedPollID = voteObj.poll_id;
			$scope.votedPollChoiceID = voteObj.choice;

			console.log(voteObj);
			console.log($scope.votedPollID);
			console.log($scope.votedPollChoiceID);
			
			$http.post('/api/polls/' + $scope.votedPollID + '/' + $scope.votedPollChoiceID)
				.success(function (data) 
				{
					console.log(data);
					$scope.poll = data;
					//alert('Thanks for voting!');

				})
				.error(function(data) {
					console.log('Error: ' + data);
				})
			
			alert('Thanks for your vote!');
			$state.go('home');
		}
		else
		{
			alert('You must select an option to vote for');
		}
	};
};


// Controller for creating new poll
function PollNewCtrl($scope, $location, $http, $state) {
	/*
	Define an empty poll model object that glue to ng-model in
	view/createpoll.html
	*/
	$scope.polls = {
		question: '',
		choices: [ { text: '' }, { text: '' }, { text: ''}]
	};

	// Method to add an additional choice option
	$scope.addChoice = function() {
		//Calling above "polls" model object field "choices" to create new
		//choice box
		$scope.polls.choices.push({ text: '' });
	};

	$scope.createPoll = function() {
		var poll = $scope.polls;	//assign mongo object "polls" to "var poll"
									//so createPoll() can use it as it CAN'T use
									//"$scope.polls" directly

		if(poll.question.length > 0)
		{
			var choiceCount = 0;

			//Loop through the choices, make sure at least two provided
			for(var i=0, ln = poll.choices.length; i < ln; i++)
			{
				var choice = poll.choices[i];

				//Check make sure choice is not blank
				if(choice.text.length > 0)
				{
					choiceCount++

				}
			}

			if(choiceCount > 1)
			{
				// Create a new poll from the model
				$http.post('/api/polls', $scope.polls)
					.success(function (data) {
						$scope.polls = {};
						$scope.pollChoices = data;
						console.log(data);
						alert('Poll successfully created!')
						$state.go('home');
					})
					.error(function (data) {
						console.log('Error: ' + data);
					});
			}
			else 
			 {
			  	alert('You must enter at least two choices');
			 }
		}
		else
		{
			alert('You must enter a question!');
			//$state.go('create');
		}
	}
}

AppCtrl.config([
'$stateProvider',
'$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {
	$stateProvider
		.state('home', {
			url: '/home',
			templateUrl: '/partials/main.html',
			controller: 'mainController',
		})
		.state('create', {
			url: '/create',
			templateUrl: '/partials/createpoll.html',
			controller: 'PollNewCtrl',
		})
		.state('polldetail', {
			url: '/polldetail/:id',
			templateUrl: '/partials/displaypoll.html',
			controller: 'DisplayPollCtrl',
		})
		.state('result', {
			url: '/result/:id',
			templateUrl: '/partials/pollresult.html',
			controller: 'DisplayPollCtrl'
		})
		$urlRouterProvider.otherwise('home');
}]);
