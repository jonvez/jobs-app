var express = require('express');
var mongoose = require('mongoose');

var Submission = mongoose.model('Submission');
var Candidate = mongoose.model('Candidate');
var Questionnaire = mongoose.model('Questionnaire');

var router = express.Router();

router.param('questionnaire', function(req, res, next, id){
  var query = Questionnaire.findById(id);

  query.exec(function(err, questionnaire){
    if(err) { return next(err); }
    if(!questionnaire) { return next(new Error('questionnaire not found')); }

    req.questionnaire = questionnaire;
    return next();
  });
});

router.param('submission', function(req, res, next, id){
  var query = Submission.findById(id);

  query.exec(function(err, submission){
    if(err) { return next(err); }
    if(!submission) { return next(new Error('submission not found')); }

    req.submission = submission;
    return next();
  });
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/questionnaires', function(req, res, next) {
  Questionnaire.find(function(err, questionnaires){
    if(err){return next(err)};

    res.json(questionnaires);
  });
});

router.post('/questionnaires', function(req, res, next){
  var questionnaire = new Questionnaire(req.body);

  questionnaire.save(function(err, questionnaire){
    if(err) return next(err);

    res.json(questionnaire);
  });
});

router.put('/questionnaires/:questionnaire', function(req, res){
  res.json(questionnaire);
});

router.get('/questionnaires/:questionnaire', function(req, res){
  req.questionnaire.populate('submissions', function(err, questionnaire){
    if(err){ return next(err); }
    res.json(questionnaire);
  });

});

router.put('/questionnaires/:questionnaire/submissions', function(req, res){
  var submission = new Submission(req.body);

  req.questionnaire.submissions.push(submission);
  var submissionURL = ['/user/submission/', ].join('')
  //todo send questionnaire via email
  res.json(submission);
});

router.get('/questionnaires/:questionnaire/submissions/:submission', function(req, res){
  res.json(questionnaire);
});


router.get('', function(req, res, next) {
  Submission.find(function(err, submissions){
    if(err){return next(err)};

    res.json(submissions);
  });
});

router.post('/submissions', function(req, res, next) {
  var submission = new Submission(req.body);

  Submission.find(function(err, submissions){
    if(err){return next(err)};

    res.json(submissions);
  });
});

router.put('/submissions/:submission/complete', function(req, res, next){

  submission.save(function(err, submission){
    if(err) return next(err);

    res.json(submission);
  });
});

router.put('/submissions/:submission', function(req, res, next){

  submission.save(function(err, submission){
    if(err) return next(err);

    res.json(submission);
  });
});

router.get('/submissions/:submission', function(req, res, next){
  res.json(submission);
});

router.get('/candidates/:candidate', function(req, res, next, id){
  var query = Candidate.findById(id);

  query.exec(function(err, candidate){
    if(err) { return next(err); }
    if(!candidate) { return next(new Error('candidate not found')); }
    candidate.populate('submission')
    res.json(candidate);
  });
});


module.exports = router;
