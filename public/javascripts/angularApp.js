var app = angular.module('jobsAppClient', ['ui.router', 'checklist-model']);

app.controller('MainCtrl',[
  '$scope',
  function($scope) { }
]);

app.controller('QuestionsCtrl',[
  '$scope',
  'questionSvc',
  function($scope, questionSvc) {
    $scope.questions = questionSvc.questions;
    $scope.addQuestion = function(){
      if(!$scope.question || !$scope.question.q || $scope.question.q === '') { return; }
      questionSvc.save($scope.question);
      $scope.question = null;
    };
  }
]);

app.controller('QuestionCtrl',[
  '$scope',
  'questionSvc',
  'question',
  function($scope, questionSvc, question) {
    $scope.question = question;
    $scope.saveQuestion = function(){
      if(!$scope.question || !$scope.question.q || $scope.question.q === '') { return; }
      questionSvc.save($scope.question);
      $scope.question = null;
    };
  }
]);

app.controller('QuestionnairesCtrl',[
  '$scope',
  'questionnaireSvc',
  'questionSvc',
  function($scope, questionnaireSvc, questionSvc) {
    $scope.questions = questionSvc.questions;
    $scope.questionnaires = questionnaireSvc.questionnaires;
    $scope.questionnaire = {name: '', questions: [], candidate: {}};
    $scope.selectedQuestions = {questions: []};
    $scope.addQuestionnaire = function(){
      questionnaire = $scope.questionnaire;
      questionnaire.questionAnswerPairs = [];
      for(var i = 0; i < $scope.selectedQuestions.questions.length; i++){
        questionnaire.questionAnswerPairs.push({
          question: $scope.selectedQuestions.questions[i]._id,
          answer: ''
        });
      }
      //todo clean up
      questionnaire.name = 'new Questionnaire';
      //questionnaire.name = 'Questionnaire for ' + questionnaire.candidate.name;
      questionnaireSvc.save(questionnaire);
      $scope.questionnaire = null;
      $scope.selectedQuestions = [];
    };
  }
]);

app.controller('QuestionnaireCtrl',[
  '$scope',
  'questionnaireSvc',
  'questionnaire',
  function($scope, questionnaireSvc, questionnaire) {
    $scope.questionnaire = questionnaire;
    $scope.saveQuestionnaire = function(){
      questionnaireSvc.save($scope.questionnaire);
      $scope.questionnaire = null;
    };
    $scope.sendQuestionnaire = function(){
      questionnaireSvc.send($scope.questionnaire);
    };
  }
]);

app.controller('ResponseCtrl',[
  '$scope',
  'questionnaireSvc',
  'questionnaire',
  function($scope, questionnaireSvc, questionnaire) {
    console.log(questionnaire);
    $scope.questionnaire = questionnaire;
    $scope.saveResponse = function(){
      questionnaireSvc.respond($scope.questionnaire, false);
    };
    $scope.submitResponse = function(){
      questionnaireSvc.respond($scope.questionnaire, true);
    };
  }
]);

app.factory('questionSvc', ['$http', function($http){
  var o = { questions: [] };
  o.getAll = function(){
    return $http.get('/questions').success(function(data){
      angular.copy(data, o.questions);
    });
  };
  o.get = function(id){
    return $http.get('/questions/' + id).then(function(res){
      return res.data;
    });
  };
  o.save = function(question){
    if(!question._id || question._id === ''){
      return $http.post('/questions', question).success(function(data){
        o.questions.push(data);
      });
    } else {
      return $http.put('/questions/' + question._id, question);
    }
  };
  return o;
}]);

app.factory('questionnaireSvc', ['$http', function($http){
  var o = { questionnaires: [] };
  o.getAll = function(){
    return $http.get('/questionnaires').success(function(data){
      angular.copy(data, o.questionnaires);
    });
  };
  o.get = function(id){
    return $http.get('/questionnaires/' + id).then(function(res){
      return res.data;
    });
  };
  o.save = function(questionnaire){
    if(!questionnaire._id || questionnaire._id === ''){
      return $http.post('/questionnaires', questionnaire).success(function(data){
        o.questionnaires.push(data);
      });
    } else {
      return $http.put('/questionnaires/' + questionnaire._id, questionnaire);
    }
  };
  o.respond = function(questionnaire, complete){
    return $http.put('/questionnaires/' + questionnaire._id + (complete ? '/respond' : '/complete'), questionnaire);
  };
  o.send = function(questionnaire){
    return $http.post('/questionnaires/' + questionnaire._id + '/send', questionnaire);
  };
  return o;
}]);

app.config([
  '$stateProvider',
  '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider){
    $stateProvider.state('home', {
      url: '/home',
      templateUrl: '/home.html',
      controller: 'MainCtrl'
    });
    $stateProvider.state('questions', {
      url: '/questions',
      templateUrl: '/questions.html',
      controller: 'QuestionsCtrl',
      resolve: {
        questionsPromise: ['questionSvc', function(questionSvc){
          return questionSvc.getAll();
        }]
      }
    });
    $stateProvider.state('question', {
      url: '/questions/{id}',
      templateUrl: '/question.html',
      controller: 'QuestionCtrl',
      resolve: {
        question: ['$stateParams', 'questionSvc', function($stateParams, questionSvc){
          return questionSvc.get($stateParams.id);
        }]
      }
    });
    $stateProvider.state('questionnaires', {
      url: '/questionnaires',
      templateUrl: '/questionnaires.html',
      controller: 'QuestionnairesCtrl',
      resolve: {
        questionnaires: ['questionnaireSvc', function(questionnaireSvc){
          return questionnaireSvc.getAll();
        }],
        questions: ['questionSvc', function(questionSvc){
          return questionSvc.getAll();
        }]
      }
    });
    $stateProvider.state('questionnaire', {
      url: '/questionnaires/{id}',
      templateUrl: '/questionnaire.html',
      controller: 'QuestionnaireCtrl',
      resolve: {
        questionnaireSvc: ['$stateParams', 'questionnaireSvc', function($stateParams, questionnaireSvc){
          return questionnaireSvc.get($stateParams.id);
        }]
      }
    });
    $stateProvider.state('response', {
      url: '/questionnaires/{id}/response',
      templateUrl: '/response.html',
      controller: 'ResponseCtrl',
      resolve: {
        questionnaire: ['$stateParams', 'questionnaireSvc', function($stateParams, questionnaireSvc){
          return questionnaireSvc.get($stateParams.id);
        }]
      }
    });

    $urlRouterProvider.otherwise('home');
}]);

