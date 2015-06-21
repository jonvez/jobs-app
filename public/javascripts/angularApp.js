var app = angular.module('jobsAppClient', ['ui.router', 'checklist-model']);

app.controller('MainCtrl',[
  '$scope',
  'auth',
  function($scope, auth) {
    $scope.isLoggedIn = auth.isLoggedIn;
  }
]);

app.controller('QuestionsCtrl',[
  '$scope',
  'questionSvc',
  'auth',
  function($scope, questionSvc, auth) {
    $scope.isLoggedIn = auth.isLoggedIn;
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
  'auth',
  function($scope, questionSvc, question, auth) {
    $scope.isLoggedIn = auth.isLoggedIn;
    $scope.question = question;
    $scope.saveQuestion = function(){
      if(!$scope.question || !$scope.question.q || $scope.question.q === '') { return; }
      questionSvc.save($scope.question);
    };
  }
]);

app.controller('QuestionnairesCtrl',[
  '$scope',
  'questionnaireSvc',
  'questionSvc',
  'auth',
  function($scope, questionnaireSvc, questionSvc, auth) {
    $scope.isLoggedIn = auth.isLoggedIn;
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
  'auth',
  function($scope, questionnaireSvc, questionnaire, auth) {
    $scope.isLoggedIn = auth.isLoggedIn;
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
  'auth',
  function($scope, questionnaireSvc, questionnaire, auth) {
    $scope.isLoggedIn = auth.isLoggedIn;
    $scope.questionnaire = questionnaire;
    $scope.saveResponse = function(){
      questionnaireSvc.respond($scope.questionnaire, false);
    };
    $scope.submitResponse = function(){
      questionnaireSvc.respond($scope.questionnaire, true);
    };
  }
]);

app.controller('AuthCtrl', [
  '$scope',
  '$state',
  'auth',
  function($scope, $state, auth){
    $scope.user = {};
    $scope.register = function() {
      auth.register($scope.user).error(function (error) {
        $scope.error = error;
      }).then(function () {
        $state.go('adminHome');
      });
    };
    $scope.logIn = function(){
      auth.logIn($scope.user).error(function(error){
        $scope.error = error;
      }).then(function(){
        $state.go('adminHome');
      });
    };
  }]);

app.controller('NavCtrl', [
  '$scope',
  'auth',
  function($scope, auth){
    $scope.isLoggedIn = auth.isLoggedIn;
    $scope.currentUser = auth.currentUser;
    $scope.logOut = auth.logOut;
}]);

app.factory('questionSvc', ['$http', 'auth', function($http, auth){
  var o = { questions: [] };
  o.getAll = function(){
    return $http.get('/questions', {
      headers: {Authorization: 'Bearer ' + auth.getToken() }
    }).success(function(data){
      angular.copy(data, o.questions);
    });
  };
  o.get = function(id){
    return $http.get('/questions/' + id, {
      headers: {Authorization: 'Bearer ' + auth.getToken() }
    }).then(function(res){
      return res.data;
    });
  };
  o.save = function(question){
    if(!question._id || question._id === ''){
      return $http.post('/questions', question, {
        headers: {Authorization: 'Bearer ' + auth.getToken() }
      }).success(function(data){
        o.questions.push(data);
      });
    } else {
      return $http.put('/questions/' + question._id, question, {
        headers: {Authorization: 'Bearer ' + auth.getToken() }
      });
    }
  };
  return o;
}]);

app.factory('questionnaireSvc', ['$http', 'auth', function($http, auth){
  var o = { questionnaires: [] };
  o.getAll = function(){
    return $http.get('/questionnaires', {
      headers: {Authorization: 'Bearer ' + auth.getToken() }
    }).success(function(data){
      angular.copy(data, o.questionnaires);
    });
  };
  o.get = function(id){
    return $http.get('/questionnaires/' + id, {
      headers: {Authorization: 'Bearer ' + auth.getToken() }
    }).then(function(res){
      return res.data;
    });
  };
  o.save = function(questionnaire){
    if(!questionnaire._id || questionnaire._id === ''){
      return $http.post('/questionnaires', questionnaire, {
        headers: {Authorization: 'Bearer ' + auth.getToken() }
      }).success(function(data){
        o.questionnaires.push(data);
      });
    } else {
      return $http.put('/questionnaires/' + questionnaire._id, questionnaire, {
        headers: {Authorization: 'Bearer ' + auth.getToken() }
      });
    }
  };
  o.respond = function(questionnaire, complete){
    return $http.put('/questionnaires/' + questionnaire._id + (complete ? '/respond' : '/complete'), questionnaire, {
      headers: {Authorization: 'Bearer ' + auth.getToken() }
    });
  };
  o.send = function(questionnaire){
    return $http.post('/questionnaires/' + questionnaire._id + '/send', questionnaire, {
      headers: {Authorization: 'Bearer ' + auth.getToken() }
    });
  };
  return o;
}]);

app.factory('auth', ['$http', '$window', '$location', function($http, $window, $location){
  var auth = {};
  auth.saveToken = function(token){
    $window.localStorage['jobs-app-token'] = token;
  };
  auth.getToken = function(){
    return $window.localStorage['jobs-app-token'];
  };
  auth.parseToken = function(token){
    //todo handle error case
    return JSON.parse($window.atob(token.split('.')[1]));
  };
  auth.isLoggedIn = function(){
    var token = auth.getToken();
    if(token){
      var payload = auth.parseToken(token);
      return payload.exp > Date.now() / 1000;
    } else {
      return false;
    }
  };
  auth.currentUser = function(){
    if(auth.isLoggedIn()){
      var token = auth.getToken();
      var payload = auth.parseToken(token);
      return payload.username;
    }
  };
  auth.register = function(user){
    return $http.post('/register', user).success(function(data){
      auth.saveToken(data.token);
    });
  };
  auth.logIn = function(user){
    return $http.post('/login', user).success(function(data){
      auth.saveToken(data.token);
    });
  };
  auth.logOut = function(){
    $window.localStorage.removeItem(['jobs-app-token']);
    $location.path('/').replace();
  };
  return auth;
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
    $stateProvider.state('adminHome', {
      url: '/admin/home',
      templateUrl: '/adminHome.html',
      controller: 'MainCtrl'
    });
    $stateProvider.state('questions', {
      url: '/admin/questions',
      templateUrl: '/questions.html',
      controller: 'QuestionsCtrl',
      onEnter: ['$state', 'auth', function($state, auth){
        if(!auth.isLoggedIn()){
          $state.go('home');
        }
      }],
      resolve: {
        questionsPromise: ['questionSvc', function(questionSvc){
          return questionSvc.getAll();
        }]
      }
    });
    $stateProvider.state('question', {
      url: '/admin/questions/{id}',
      templateUrl: '/question.html',
      controller: 'QuestionCtrl',
      onEnter: ['$state', 'auth', function($state, auth){
        if(!auth.isLoggedIn()){
          $state.go('home');
        }
      }],
      resolve: {
        question: ['$stateParams', 'questionSvc', function($stateParams, questionSvc){
          return questionSvc.get($stateParams.id);
        }]
      }
    });
    $stateProvider.state('questionnaires', {
      url: '/admin/questionnaires',
      templateUrl: '/questionnaires.html',
      controller: 'QuestionnairesCtrl',
      onEnter: ['$state', 'auth', function($state, auth){
        if(!auth.isLoggedIn()){
          $state.go('home');
        }
      }],
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
      url: '/admin/questionnaires/{id}',
      templateUrl: '/questionnaire.html',
      controller: 'QuestionnaireCtrl',
      onEnter: ['$state', 'auth', function($state, auth){
        if(!auth.isLoggedIn()){
          $state.go('home');
        }
      }],
      resolve: {
        questionnaire: ['$stateParams', 'questionnaireSvc', function($stateParams, questionnaireSvc){
          return questionnaireSvc.get($stateParams.id);
        }]
      }
    });
    $stateProvider.state('response', {
      url: '/admin/questionnaires/{id}/response',
      templateUrl: '/response.html',
      controller: 'ResponseCtrl',
      onEnter: ['$state', 'auth', function($state, auth){
        if(!auth.isLoggedIn()){
          $state.go('home');
        }
      }],
      resolve: {
        questionnaire: ['$stateParams', 'questionnaireSvc', function($stateParams, questionnaireSvc){
          return questionnaireSvc.get($stateParams.id);
        }]
      }
    });
    $stateProvider.state('register', {
      url: '/admin/register',
      templateUrl: '/register.html',
      controller: 'AuthCtrl',
      onEnter: ['$state', 'auth', function($state, auth){
        if(auth.isLoggedIn()){
          $state.go('home');
        }
      }]
    });
    $stateProvider.state('login', {
      url: '/admin/login',
      templateUrl: '/login.html',
      controller: 'AuthCtrl',
      onEnter: ['$state', 'auth', function($state, auth){
        if(auth.isLoggedIn()){
          $state.go('home');
        }
      }]
    });

    $urlRouterProvider.otherwise('home');
}]);

