var express = require('express');
var mongoose = require('mongoose');

var Candidate = mongoose.model('Candidate');
var Question = mongoose.model('Question');
var Questionnaire = mongoose.model('Questionnaire');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'JobsApp' });
});

router.param('questionnaire', function(req, res, next, id){
  var query = Questionnaire.findById(id);
  query.exec(function(err, questionnaire){
    if(err) { return next(err); }
    if(!questionnaire) { return next(new Error('questionnaire not found')); }
    req.questionnaire = questionnaire;
    return next();
  });
});

router.param('question', function(req, res, next, id){
  var query = Question.findById(id);
  query.exec(function(err, question){
    if(err) { return next(err); }
    if(!question) { return next(new Error('question not found')); }
    req.question = question;
    return next();
  });
});

router.get('/questionnaires', function(req, res, next) {
  Questionnaire.find(function(err, questionnaires){
    if(err){ return next(err); }
    res.json(questionnaires);
  });
});

router.get('/questions', function(req, res, next) {
  Question.find(function(err, questions){
    if(err){ return next(err); }
    res.json(questions);
  });
});

router.post('/questionnaires', function(req, res, next){
  var questionnaire = new Questionnaire(req.body);
  questionnaire.save(function(err, questionnaire){
    if(err) { return next(err); }
    res.json(questionnaire);
  });
});

router.post('/questions', function(req, res, next){
  var question = new Question(req.body);
  question.save(function(err, question){
    if(err) { return next(err); }
    res.json(question);
  });
});

router.put('/questionnaires/:questionnaire', function(req, res, next){
  var questionnaire = req.body;
  Questionnaire.findByIdAndUpdate(questionnaire._id, questionnaire, function(err, questionnaire){
    if(err) { return next(err); }
    res.json(questionnaire);
  });
});

router.put('/questions/:question', function(req, res, next){
  var question = req.body;
  Question.findByIdAndUpdate(question._id, question, function(err, question){
    if(err) { return next(err); }
    res.json(question);
  });
});

router.get('/questionnaires/:questionnaire', function(req, res){
  res.json(req.questionnaire);
});

router.get('/questions/:question', function(req, res){
  res.json(req.question);
});

//router.put('/submissions/:submission/complete', function(req, res, next){
//
//  submission.save(function(err, submission){
//    if(err) return next(err);
//
//    res.json(submission);
//  });
//});
//
//router.get('/candidates/:candidate', function(req, res, next, id){
//  var query = Candidate.findById(id);
//
//  query.exec(function(err, candidate){
//    if(err) { return next(err); }
//    if(!candidate) { return next(new Error('candidate not found')); }
//    candidate.populate('submission')
//    res.json(candidate);
//  });
//});

module.exports = router;
