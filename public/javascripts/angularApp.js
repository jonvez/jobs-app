var app = angular.module('jobsApp', ['ui.router'])

  .controller('AuthCtrl', [
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
    }])

  .controller('NavCtrl', [
    '$scope',
    'auth',
    function($scope, auth){
      $scope.isLoggedIn = auth.isLoggedIn;
      $scope.currentUser = auth.currentUser;
      $scope.logOut = auth.logOut;
    }])

  .controller('QuestionnaireCtrl',[
    '$state',
    '$scope',
    '$location',
    'questionSvc',
    'questionnaireSvc',
    'questionnaire',
    function($state, $scope, $location, questionSvc, questionnaireSvc, questionnaire) {
      $scope.questions = questionSvc.questions;
      $scope.question = {};
      $scope.questionnaire = questionnaire || {
          candidate: {},
          questionAnswerPairs: [],
          sent: false,
          completed: false
        };
      $scope.setSelectedQuestions = function(){
        $scope.selectedQuestions = [];
        for(var i = 0; i < $scope.questionnaire.questionAnswerPairs.length; i++){
          $scope.selectedQuestions.push($scope.questionnaire.questionAnswerPairs[i].question);
        }
      };
      $scope.setSelectedQuestions();
      $scope.createQuestionnaireAndCandidate = function(){
        questionnaireSvc.saveCandidate($scope.questionnaire.candidate).error(function(err){
          $scope.error = err;
        }).then(function(res){
          $scope.questionnaire.candidate = res.data;
          $scope.questionnaire.name = 'Questionnaire for ' + $scope.questionnaire.candidate.name;
          questionnaireSvc.saveQuestionnaire($scope.questionnaire).error(function(err){
            $scope.error = err;
          }).then(function(res){
            $scope.questionnaire = res.data;
            $location.path('/admin/questionnaires/' + $scope.questionnaire._id).replace();
          });
        });
      };
      $scope.addQuestion = function(){
        if(!$scope.question || !$scope.question.q) return;
        questionSvc.save($scope.question).error(function(err){
          $scope.error = err;
        }).then(function(res){
          var question = res.data;
          $scope.questionnaire.questionAnswerPairs.push({question: question, answer: ''});
          $scope.selectedQuestions.push(question);
        });
        $scope.question = {};
      };
      $scope.saveToQuestionnaire = function(){
        $scope.syncSelections($scope.selectedQuestions);
        questionnaireSvc.saveQuestionnaire($scope.questionnaire).error(function(err){
          $scope.error = err;
        }).then(function(res){
          $scope.questionnaire = res.data;
          $location.path('/admin/questionnaires/' + $scope.questionnaire._id + '/review').replace();
        });
      };
      //todo rewrite this really gross, naive implementation
      //most/all this checkbox code is likely unnecessary; there has to be a better, more angular way
      $scope.toggleSelected = function(question, checked){
        var index = -1;
        for(var i = 0; i < $scope.selectedQuestions.length; i++){
          if(question._id === $scope.selectedQuestions[i]._id){
            index = i;
            if(!checked) {
              $scope.selectedQuestions.splice(index, 1);
            }
            break;
          }
        }
        if(checked && index == -1){
          $scope.selectedQuestions.push(question);
        }
      };
      $scope.isChecked = function(question){
        for(var i = 0; i < $scope.selectedQuestions.length; i++){
          if(question._id === $scope.selectedQuestions[i]._id){
            return true;
          }
        }
        return false;
      };
      $scope.syncSelections = function(){
        $scope.questionnaire.questionAnswerPairs = [];
        for(var i = 0; i < $scope.selectedQuestions.length; i++){
          $scope.questionnaire.questionAnswerPairs.push({
            question: $scope.selectedQuestions[i],
            answer: ''
          });
        }
      };
      $scope.sendQuestionnaire = function(){
        questionnaireSvc.sendQuestionnaire($scope.questionnaire);
        $location.path('/admin');
      };
    }
  ])

  .controller('QuestionnairesCtrl',[
    '$scope',
    'questionnaireSvc',
    'questionnaires',
    function($scope, questionnaireSvc, questionnaires) {
      $scope.questionnaires = questionnaireSvc.questionnaires;
      $scope.showResponses = null;
      $scope.toggleShowResponses = function(id){
        $scope.showResponses = id;
      }
    }
  ])

  .controller('ResponseCtrl',[
    '$state',
    '$scope',
    'responseSvc',
    'questionnaire',
    function($state, $scope, responseSvc, questionnaire) {
      $scope.questionnaire = questionnaire;
      $scope.saveResponse = function(){
        responseSvc.respond($scope.questionnaire);
        $state.go('home');
      };
    }
  ])

  .factory('questionnaireSvc', ['$http', 'auth', function($http, auth){
    var o = {
      questionnaires: [],
      candidates: []
    };
    o.getAllQuestionnaires = function(){
      return $http.get('/questionnaires', {
        headers: {Authorization: 'Bearer ' + auth.getToken() }
      }).success(function(data){
        angular.copy(data, o.questionnaires);
      });
    };
    o.getQuestionnaire = function(id){
      return $http.get('/questionnaires/' + id, {
        headers: {Authorization: 'Bearer ' + auth.getToken() }
      }).then(function(res){
        return res.data;
      });
    };
    o.saveQuestionnaire = function(questionnaire){
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
    o.saveCandidate = function(candidate){
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
    o.sendQuestionnaire = function(questionnaire){
      return $http.post('/questionnaires/' + questionnaire._id + '/send', questionnaire, {
        headers: {Authorization: 'Bearer ' + auth.getToken() }
      });
    };
    o.findCandidateByEmail = function(email){
      return $http.get('/candidates/locate/?email=' + email);
    };
    return o;
  }])

  .factory('responseSvc', ['$http', function($http){
    var o = {};
    o.getMyQuestionnaire = function(id){
      return $http.get('/questionnaires/' + id).then(function(res){
        return res.data;
      });
    };
    o.findCandidateByEmail = function(email){
      return $http.get('/candidates/locate/?email=' + email);
    };
    o.respond = function(questionnaire){
      return $http.put('/questionnaires/' + questionnaire._id + '/respond', questionnaire);
    };
    return o;
  }])

  .factory('questionSvc', ['$http', 'auth', function($http, auth){
    var o = {
      questions: []
    };
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
  }])

  .factory('auth', ['$http', '$window', '$location', function($http, $window, $location){
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
  }])

.config([
    '$stateProvider',
    '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider){

      $stateProvider

        .state('home', {
          url: '/home',
          templateUrl: '/home.html',
          controller: 'ResponseCtrl',
          resolve: {
            questionnaire: [function () {}]
          }
        })
        .state('admin', {
          url: '/admin',
          templateUrl: '/admin.html',
          controller: 'QuestionnaireCtrl',
          onEnter: ['$state', 'auth', function($state, auth){
            if(!auth.isLoggedIn()){
              $state.go('home');
            }
          }]
          ,
          resolve: {
            q1: ['$stateParams', 'questionnaireSvc', function($stateParams, questionnaireSvc){
              return questionnaireSvc.getAllQuestionnaires();
            }],
            q2: ['$stateParams', 'questionSvc', function($stateParams, questionSvc){
              return questionSvc.getAll();
            }],
            questionnaire: ['$stateParams', 'questionnaireSvc', function ($stateParams, questionnaireSvc) {
              if($stateParams.id){
                return questionnaireSvc.getQuestionnaire($stateParams.id);
              }
            }]
          }
        })
        .state('questionnaires', {
          url: '/admin/questionnaires',
          templateUrl: '/admin-questionnaires.html',
          controller: 'QuestionnairesCtrl',
          resolve: {
            questionnaires: ['$stateParams', 'questionnaireSvc', function($stateParams, questionnaireSvc){
              return questionnaireSvc.getAllQuestionnaires();
            }]
          }
        })
        .state('questionnaire', {
          url: '/admin/questionnaires/{id}',
          templateUrl: '/admin-questions.html',
          controller: 'QuestionnaireCtrl',
          onEnter: ['$state', 'auth', function($state, auth){
            if(!auth.isLoggedIn()){
              $state.go('home');
            }
          }],
          resolve: {
            q2: ['$stateParams', 'questionSvc', function($stateParams, questionSvc){
              return questionSvc.getAll();
            }],
            questionnaire: ['$stateParams', 'questionnaireSvc', function ($stateParams, questionnaireSvc) {
              if($stateParams.id){
                return questionnaireSvc.getQuestionnaire($stateParams.id);
              }
            }]
          }
        })
        .state('review', {
          url: '/admin/questionnaires/{id}/review',
          templateUrl: '/admin-review.html',
          controller: 'QuestionnaireCtrl',
          onEnter: ['$state', 'auth', function($state, auth){
            if(!auth.isLoggedIn()){
              $state.go('home');
            }
          }],
          resolve: {
            questionnaire: ['$stateParams', 'questionnaireSvc', function ($stateParams, questionnaireSvc) {
              if($stateParams.id){
                return questionnaireSvc.getQuestionnaire($stateParams.id);
              }
            }]
          }
        })
        .state('reviewResponse', {
          url: '/admin/questionnaires/{id}/response',
          templateUrl: '/admin-response.html',
          controller: 'QuestionnaireCtrl',
          onEnter: ['$state', 'auth', function($state, auth){
            if(!auth.isLoggedIn()){
              $state.go('home');
            }
          }],
          resolve: {
            questionnaire: ['$stateParams', 'questionnaireSvc', function ($stateParams, questionnaireSvc) {
              if($stateParams.id){
                return questionnaireSvc.getQuestionnaire($stateParams.id);
              }
            }]
          }
        })
        .state('response', {
          url: '/questionnaires/{id}/response',
          templateUrl: '/response.html',
          controller: 'ResponseCtrl',
          resolve: {
            questionnaire: ['$stateParams', 'responseSvc', function ($stateParams, responseSvc) {
              return responseSvc.getMyQuestionnaire($stateParams.id);
            }]
          }
        })
      ;

      $urlRouterProvider
        .otherwise('home');
  }]);
