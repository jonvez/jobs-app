var mongoose = require('mongoose');

var CandidateSchema = new mongoose.Schema({
  name: String,
  email: String,
  questionnaire: {type: mongoose.Schema.Types.ObjectId, ref: 'Questionnaire'}
});

CandidateSchema.methods.findByEmail = function(callback){
  //todo is this method necessary? mongoose find?
};

mongoose.model('Candidate', CandidateSchema);