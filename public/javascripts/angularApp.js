var app = angular.module('jobsAppClient', ['ui.router']);

app.controller('MainCtrl',[
    '$scope',
    function($scope){
    }]);

app.controller('SubmissionCtrl',[
    '$scope',
    '$stateParams',
    'questionnaires',
    function($scope, $stateParams, questionnaires){
        $scope.questionnaires = questionnaires;
        $scope.saveSubmission = function(){

        };
    }]);

app.controller('QuestionnaireCtrl',[
    '$scope',
    '$stateParams',
    'questionnaires',
    function($scope, $stateParams, questionnaires){
        $scope.questionnaires = questionnaires;
        $scope.createQuestionnaire = function(){
            if(!$scope.questions || $scope.questions === []) { return; }
            $scope.questionnaires.push({
                questions: $scope.questions,


            });

        };
        //$scope.saveQuestionnaire = function(questionnaire){
        //
        //};
        //$scope.deleteQuestionnaire = function(questionnaire){
        //
        //};
        //$scope.publishQuestionnaire = function(questionnaire){
        //
        //};
    }]);

app.factory('questionnaires', [function(){
    var questionnaires = [{
        name: 'stub',
        questions: [
            {question: "What's the coolest problem you've solved that's applicable to the role you'd like to have with FoodLogiQ? Why should we think it's cool, too?", sequence: 1},
            {question: "Describe the environment that would exist at your dream job. The culture, people, office, tools, etc. - whatever details you think would make it awesome. Don't worry about trying to describe us so we think you think we're your dream employer; we're more interested in you, not us.", sequence: 2},
            {question: "What design and development assumptions and decisions went into your solution for Step 1?", sequence: 3}
        ]
    }];
    return questionnaires;
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
        $stateProvider.state('submission', {
            url: '/submission',
            templateUrl: '/submission.html',
            controller: 'SubmissionCtrl'
        });
        $stateProvider.state('questionnaire', {
            url: '/questionnaire',
            templateUrl: '/questionnaire.html',
            controller: 'QuestionnaireCtrl'
        });

        $urlRouterProvider.otherwise('home');
    }]);

