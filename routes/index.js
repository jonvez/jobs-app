var express = require('express');
var mongoose = require('mongoose');
var url = require('url');
var passport = require('passport');
var jwt = require('express-jwt');
var nodeMailer = require('nodemailer');

var transporter = nodeMailer.createTransport();
transporter.emailFrom = 'jonvez+jobs-app@gmail.com';

//todo externalize
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

var Candidate = mongoose.model('Candidate');
var Question = mongoose.model('Question');
var Questionnaire = mongoose.model('Questionnaire');
var User = mongoose.model('User');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'JobsApp' });
});

router.param('questionnaire', function(req, res, next, id){
  Questionnaire.findById(id)
    .populate('candidate questionAnswerPairs.question')
    .exec(function(err, questionnaire){
    if(err) { return next(err); }
    if(!questionnaire) { return next(new Error('questionnaire not found')); }
      console.log('param');
      console.log(questionnaire);
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

router.get('/questionnaires', auth, function(req, res, next) {
  Questionnaire.find()
    .populate('candidate questionAnswerPairs questionAnswerPairs.question')
    .exec(function(err, questionnaires){
      if(err){ return next(err); }
      res.json(questionnaires);
  })
});

router.get('/questions', auth, function(req, res, next) {
  Question.find(function(err, questions){
    if(err){ return next(err); }
    res.json(questions);
  });
});

router.get('/candidates', auth, function(req, res, next) {
  Candidate.find(function(err, questions){
    if(err){ return next(err); }
    res.json(questions);
  });
});

router.post('/questionnaires', auth, function(req, res, next){

  var questionnaire = new Questionnaire(req.body);
  questionnaire.save(function(err, questionnaire){
    if(err) { return next(err); }
    res.json(questionnaire);
  });
});

router.post('/questions', auth, function(req, res, next){
  var question = new Question(req.body);
  question.save(function(err, question){
    if(err) { return next(err); }
    res.json(question);
  });
});

router.post('/candidates', auth, function(req, res, next){
  var candidate = new Candidate(req.body);
  candidate.save(function(err, candidate){
    if(err) { return next(err); }
    res.json(candidate);
  });
});

router.get('/questions/:question', auth, function(req, res){
  res.json(req.question);
});

router.get('/questionnaires/:questionnaire', function(req, res){
  req.questionnaire.populate('candidate questionAnswerPairs questionAnswerPairs.question', function(err, questionnaire){
    console.log('method');
    console.log(questionnaire);
    if(err){ return next(err); }
    res.json(questionnaire);
  });
});

router.get('/candidates/:candidate', auth, function(req, res){
  res.json(req.candidates);
});

router.put('/questions/:question', auth, function(req, res, next){
  var question = req.body;
  Question.findByIdAndUpdate(question._id, question, function(err, question){
    if(err) { return next(err); }
    res.json(question);
  });
});

router.put('/questionnaires/:questionnaire', auth, function(req, res, next){
  var questionnaire = req.body;
  Questionnaire.findByIdAndUpdate(questionnaire._id, questionnaire, function(err, questionnaire){
    if(err) { return next(err); }
    res.json(questionnaire);
  });
});

router.put('/candidates/:candidate', auth, function(req, res, next){
  var candidate = req.body;
  Candidate.findByIdAndUpdate(candidate._id, candidate, function(err, candidate){
    if(err) { return next(err); }
    res.json(candidate);
  });
});

router.put('/questionnaires/:questionnaire/respond', function(req, res, next){
  //todo only allow answers & flags to be changed
  var questionnaire = req.body;
  Questionnaire.findByIdAndUpdate(questionnaire._id, questionnaire, function(err, questionnaire){
    if(err) { return next(err); }
    res.json(questionnaire);
  });
});

router.post('/questionnaires/:questionnaire/send', auth, function(req, res, next){
  var questionnaire = req.questionnaire;
  questionnaire.sent = true;
  Questionnaire.findByIdAndUpdate(questionnaire._id, questionnaire, function(err, questionnaire){
    if(err) { return next(err); }
    res.json(questionnaire);
  });
  //todo clean up string concats
  var subjectText = "Hello, " + questionnaire.candidate.name + "\n\nThis email is a request to complete a job candidate " +
    "questionnaire based on your interest in the Acme Co.  Please click the below link to access the " +
    "questionnaire:\n\n\n\n" + generateQuestionnaireLink(questionnaire);
  transporter.sendMail({
    from: transporter.emailFrom,
    to: questionnaire.candidate.email,
    subject: questionnaire.name,
    text: subjectText
  });
});

//todo add db indexes, specifically candidate uniqueness
router.get('/candidates/locate', function(req, res, next){
  var email = url.parse(req.url).query.email;
  Candidate.findOne({email: email}).populate('questionnaire', function(err, candidate){
    if(err) { return err; }
    res.json(candidate);
  });
});

router.post('/register', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Username and password fields are required'});
  }
  var user = new User();
  user.username = req.body.username;
  user.setPassword(req.body.password);
  user.save(function(err){
    if(err){ return next(err); }
    return res.json({token: user.generateJWT()});
  });
});

router.post('/login', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Username and password fields are required'});
  }
  passport.authenticate('local', function(err, user, info){
    if(err){ return next(err); }
    if(user){
      return res.json({token: user.generateJWT()});
    } else {
      //todo clean up else block
      return res.status(401).json(info);
    }
  })(req, res, next);
});

generateQuestionnaireLink = function(questionnaire){
  //todo externalize hostname
  var hostname = "http://localhost:3000";
  return hostname + "/#/questionnaires/" + questionnaire._id + "/response";
};

module.exports = router;
