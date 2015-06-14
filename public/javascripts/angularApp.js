var app = angular.module('jobsAppClient', ['ui.router']);

app.controller('MainCtrl',[
  '$scope',
  function($scope) { }
]);

app.controller('QuestionsCtrl',[
  '$scope',
  'questionSvc',
  function($scope, questionSvc) {
    console.log('QuestionsCtrl')
    $scope.questions = questionSvc.questions;
  }
]);

app.controller('QuestionCtrl',[
  '$scope',
  'questionSvc',
  'question',
  function($scope, questionSvc, question) {
    console.log('QuestionCtrl')
    if(question){
      console.log(question);
      $scope.question = question;
    }
    console.log('after if');
    $scope.saveQuestion = function(){
      if(!$scope.question.q || $scope.question.q === '') { return; }
      questionSvc.save($scope.question);
    };
  }
]);

//app.controller('QuestionnaireCtrl',[
//  '$scope',
//  'questionnaireSvc',
//  'questionnaire',
//  function($scope, questionnaireSvc, questionnaire){
//    $scope.questionnaires = questionnaireSvc.questionnaires;
//    $scope.questionnaire = questionnaire;
//
//    //$scope.createQuestionnaire = function(){
//    //    if(!$scope.questions || $scope.questions === []) { return; }
//    //    $scope.questionnaires.push({
//    //        questions: $scope.questions
//    //
//    //
//    //    });
//    //
//    //};
//    $scope.saveQuestionnaire = function(){
//      questionnaireSvc.save($scope.questionnaire);
//    };
//    //$scope.deleteQuestionnaire = function(questionnaire){
//    //
//    //};
//    //$scope.publishQuestionnaire = function(questionnaire){
//    //
//    //};
//  }]);

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
      console.log('create');
      return $http.post('/questions', question);
    } else {
      console.log('update');
      return $http.put('/questions/' + question._id, question);
    }
  };
  return o;
}]);

//app.factory('questionnaireSvc', ['$http', function($http){
//  var o = { questionnaires: [] };
//  o.getAll = function(){
//    return $http.get('/questionnaires').success(function(data){
//      angular.copy(data, o.questionnaires);
//    });
//  };
//  o.get = function(id){
//    return $http.get('/questionnaires/' + id).then(function(res){
//      return res.data;
//    });
//  };
//  o.save = function(questionnaire){
//    return $http.put('/questionnaires/' + questionnaire._id, questionnaire);
//  };
//  return o;
//}]);

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

    $urlRouterProvider.otherwise('home');
}]);

