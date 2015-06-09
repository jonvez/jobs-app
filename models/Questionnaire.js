var mongoose = require('mongoose');

var QuestionnaireSchema = new mongoose.Schema({
    name: String,
    retired: Boolean(false),
    archived: Boolean(false),
    submissions: [{type: mongoose.Schema.Types.ObjectId, ref: 'Submission'}],
    questions: [{q: String}]
});

QuestionnaireSchema.methods.retire = function(callback){
    this.retired = true;
    this.save(callback);
};

QuestionnaireSchema.methods.archive = function(callback){
  //todo check all submissions associated with this questionnaire and set archived to true if all dubmissions have been marked completed
  //should be an asynchronous operation as it would get expensive at scale
};

mongoose.model('Questionnaire', QuestionnaireSchema);