var mongoose = require('mongoose');

var QuestionSchema = new mongoose.Schema({
  q: String
});

mongoose.model('Question', QuestionSchema);