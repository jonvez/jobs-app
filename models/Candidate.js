var mongoose = require('mongoose');

var CandidateSchema = new mongoose.Schema({
  name: String,
  email: String,
  questionnaire: {type: mongoose.Schema.Types.ObjectId, ref: 'Questionnaire'}
});

mongoose.model('Candidate', CandidateSchema);