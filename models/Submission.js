var mongoose = require('mongoose');

var SubmissionSchema = new mongoose.Schema({
  candidate: {type: mongoose.Schema.Types.ObjectId, ref: 'Candidate'},
  questionnaire: {type: mongoose.Schema.Types.ObjectId, ref: 'Questionnaire'},
  responses: [{question: String, answer: String}],
  sent: {type: Boolean(false)},
  started: {type: Boolean(false)},
  completed: {type: Boolean(false)}
});

SubmissionSchema.methods.markSent = function(callback){
  this.sent = true;
  this.save(callback);
};

SubmissionSchema.methods.markStarted = function(callback){
  this.started = true;
  this.save(callback);
};

SubmissionSchema.methods.markComplete = function(callback){
  this.completed = true;
  this.save(callback);
};

mongoose.model('Submission', SubmissionSchema);