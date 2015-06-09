var mongoose = require('mongoose');

var CandidateSchema = new mongoose.Schema({
  email: String,
  submission: {type: mongoose.Schema.Types.ObjectId, ref: 'Submission'}
});

mongoose.model('Candidate', CandidateSchema);