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

router.param('candidate', function(req, res, next, id){
  var query = Candidate.findById(id);
  query.exec(function(err, candidate){
    if(err) { return next(err); }
    if(!candidate) { return next(new Error('candidate not found')); }
    req.candidate = candidate;
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

router.get('/candidates', function(req, res, next) {
  Candidate.find(function(err, questions){
    if(err){ return next(err); }
    res.json(questions);
  });
});

router.post('/questionnaires', function(req, res, next){
  var questionnaire = new Questionnaire(req.body);
  questionnaire.save(function(err, questionnaire){
    console.log('--------------------------1');
    if(err) { console.log(err);
      return next(err); }
    console.log('--------------------------2');
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

router.post('/candidates', function(req, res, next){
  var candidate = new Candidate(req.body);
  candidate.save(function(err, candidate){
    if(err) { return next(err); }
    res.json(candidate);
  });
});

router.get('/questions/:question', function(req, res){
  res.json(req.question);
});

router.get('/questionnaires/:questionnaire', function(req, res){
  req.questionnaire.populate('candidate questionAnswerPairs questionAnswerPairs.question', function(err, questionnaire){
    if(err){ return next(err); }
    res.json(questionnaire);
  });
});

router.get('/candidates/:candidate', function(req, res){
  res.json(req.candidates);
});

router.put('/questions/:question', function(req, res, next){
  var question = req.body;
  Question.findByIdAndUpdate(question._id, question, function(err, question){
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

router.put('/candidates/:candidate', function(req, res, next){
  var candidate = req.body;
  Candidate.findByIdAndUpdate(candidate._id, candidate, function(err, candidate){
    if(err) { return next(err); }
    res.json(candidate);
  });
});

router.put('/questionnaires/:questionnaire/respond', function(req, res, next){
  //todo only allow answers & flags to be changed
  var questionnaire = req.body;
  questionnaire.inProgress = true;
  Questionnaire.findByIdAndUpdate(questionnaire._id, questionnaire, function(err, questionnaire){
    if(err) { return next(err); }
    res.json(questionnaire);
  });
});

router.put('/questionnaires/:questionnaire/complete', function(req, res, next){
  //todo only allow answers & flags to be changed
  var questionnaire = req.body;
  questionnaire.inProgress = false;
  questionnaire.completed = true;
  Questionnaire.findByIdAndUpdate(questionnaire._id, questionnaire, function(err, questionnaire){
    if(err) { return next(err); }
    res.json(questionnaire);
  });
});

router.post('/questionnaires/:questionnaire/send', function(req, res, next){
  var questionnaire = req.questionnaire;
  transporter.sendMail({
    from: 'jonvez+jobs=app@gmail.com',
    to: questionnaire.candidate.email,
    subject: questionnaire.name,
    text: 'hello mail!'
  });

});


module.exports = router;
