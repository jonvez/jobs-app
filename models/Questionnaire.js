var mongoose = require('mongoose');

var QuestionnaireSchema = new mongoose.Schema({
  name: String,
  questionAnswerPairs: [{question: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Question'},
    answer: String
  }],
  candidate: {type: mongoose.Schema.Types.ObjectId, ref: 'Candidate'},
  sent: Boolean(false),
  completed: Boolean(false)
});

mongoose.model('Questionnaire', QuestionnaireSchema);