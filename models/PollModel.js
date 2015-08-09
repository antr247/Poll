var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// Subdocument schema for votes
var voteSchema = new mongoose.Schema({
	ip: 'String' 
});

// Subdocument schema for poll choices
var choiceSchema = new mongoose.Schema({
	text: String,
	votes: [voteSchema]
});

// Document schema for polls
var PollSchema = new mongoose.Schema({
	question: { type: String, required: true },
	choices: [choiceSchema]
});

var PollModel = mongoose.model('PollModel', PollSchema);

module.exports = PollModel;