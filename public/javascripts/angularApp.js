var app = angular.module('jobsApp', ['ui.router', 'checklist-model']);

app.controller('MainCtrl',[
  '$scope',
  '$state',
  'auth',
  'questionnaireSvc',
  'candidateSvc',
  function($scope, $state, auth, questionnaireSvc, candidateSvc) {
    $scope.isLoggedIn = auth.isLoggedIn;
    $scope.createCandidate = function(){
      candidateSvc.save($scope.candidate).error(function(err){
        $scope.error = err;
      }).then(function(){
        $state.go('questions');
      });
    };
    $scope.findQuestionnaireByEmail = function(){
      questionnaireSvc.findByCandidateEmail($scope.email).error(function(err){
        $scope.error = err;
      }).then(function(candidate){
        $location.path('/questionnaire/' + candidate.questionnaire._id + '/response').replace();
        $state.go('response');
      });
    };
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
  '$state',
  'questionnaireSvc',
  'questionSvc',
  'auth',
  function($scope, $state, questionnaireSvc, questionSvc, auth) {
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
    };
  }
]);

app.controller('QuestionnaireCtrl',[
  '$scope',
  'questionnaireSvc',
  'candidateSvc',
  'questionnaire',
  'auth',
  function($scope, questionnaireSvc, candidateSvc, questionnaire, auth) {
    $scope.isLoggedIn = auth.isLoggedIn;
    $scope.questionnaire = questionnaire;
    $scope.saveQuestionnaire = function(){
      questionnaireSvc.save($scope.questionnaire);
      $scope.questionnaire = null;
    };
    $scope.sendQuestionnaire = function(){
      candidateSvc.send($scope.candidate);
    };
  }
]);

app.controller('CandidatesCtrl',[
  '$scope',
  'candidateSvc',
  'auth',
  function($scope, candidateSvc, auth) {
    $scope.isLoggedIn = auth.isLoggedIn;
    $scope.candidates = candidateSvc.candidates;
    $scope.addCandidate = function(){
      candidate = $scope.candidate;
      candidateSvc.save(candidate);
      $scope.candidate = null;
    };
  }
]);

app.controller('CandidateCtrl',[
  '$scope',
  'candidateSvc',
  'candidate',
  'auth',
  function($scope, candidateSvc, candidate, auth) {
    $scope.isLoggedIn = auth.isLoggedIn;
    $scope.candidate = candidate;
    $scope.saveCandidate = function(){
      candidateSvc.save($scope.candidate);
      $scope.candidate = null;
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
      auth.register($scope.user).error(function (err) {
        $scope.error = err;
      }).then(function () {
        $state.go('adminHome');
      });
    };
    $scope.logIn = function(){
      auth.logIn($scope.user).error(function(err){
        $scope.error = err;
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

app.factory('questionnaireSvc', ['$http', '$location', 'auth', function($http, $location, auth){
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
        console.log(data._id);
        console.log($location.path());
        $location.path('/admin/questionnaires/' + data._id).replace();
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
  o.findByCandidateEmail = function(email){
    return $http.get('/candidates/locate/?email=' + email);
  };
  return o;
}]);

app.factory('candidateSvc', ['$http', 'auth', function($http, auth){
  var o = { candidates: [] };
  o.getAll = function(){
    return $http.get('/candidates', {
      headers: {Authorization: 'Bearer ' + auth.getToken() }
    }).success(function(data){
      angular.copy(data, o.candidates);
    });
  };
  o.get = function(id){
    return $http.get('/candidates/' + id, {
      headers: {Authorization: 'Bearer ' + auth.getToken() }
    }).then(function(res){
      return res.data;
    });
  };
  o.save = function(candidate){
    if(!candidate._id || candidate._id === ''){
      return $http.post('/candidates', candidate, {
        headers: {Authorization: 'Bearer ' + auth.getToken() }
      }).success(function(data){
        o.candidates.push(data);
      });
    } else {
      return $http.put('/candidates/' + candidate._id, candidate, {
        headers: {Authorization: 'Bearer ' + auth.getToken() }
      });
    }
  };
  o.send = function(candidate){
    return $http.post('/candidates/' + candidate._id + '/send', candidate, {
      headers: {Authorization: 'Bearer ' + auth.getToken() }
    });
  };
  o.findByEmail = function(email){
    return $http.get('/candidates/locate/?email=' + email);
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
      controller: 'MainCtrl',
      questionnaire: ['$stateParams', 'questionnaireSvc', function($stateParams, questionnaireSvc){
        return questionnaireSvc.getAll();
      }],
      candidateSvc: ['$stateParams', 'candidateSvc', function($stateParams, candidateSvc){
        return candidateSvc.getAll();
      }]
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
    $stateProvider.state('candidates', {
      url: '/admin/candidates',
      templateUrl: '/candidates.html',
      controller: 'CandidatesCtrl',
      onEnter: ['$state', 'auth', function($state, auth){
        if(!auth.isLoggedIn()){
          $state.go('home');
        }
      }],
      resolve: {
        candidates: ['candidateSvc', function(candidateSvc){
          return candidateSvc.getAll();
        }]
      }
    });
    $stateProvider.state('candidate', {
      url: '/admin/candidate/{id}',
      templateUrl: '/candidate.html',
      controller: 'CandidateCtrl',
      onEnter: ['$state', 'auth', function($state, auth){
        if(!auth.isLoggedIn()){
          $state.go('home');
        }
      }],
      resolve: {
        candidate: ['$stateParams', 'candidateSvc', function($stateParams, candidateSvc){
          return candidateSvc.get($stateParams.id);
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

