var mongoose = require('mongoose');

var QuestionnaireSchema = new mongoose.Schema({
  name: String,
  questionAnswerPairs: [{question: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Question'},
    answer: String
  }],
  candidate: {type: mongoose.Schema.Types.ObjectId, ref: 'Candidate'},
  inProgress: {type: Boolean(false)},
  completed: {type: Boolean(false)}
});

QuestionnaireSchema.methods.start = function(callback){

};

QuestionnaireSchema.methods.complete = function(callback){

};

mongoose.model('Questionnaire', QuestionnaireSchema);