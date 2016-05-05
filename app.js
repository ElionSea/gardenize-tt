;
// MODULE
var myApp = angular.module('myApp', ['ngRoute', 'ngResource']);

// ROUTES
myApp.config(function($routeProvider){
	$routeProvider
	.when('/', {
		templateUrl: 'pages/main.html',
		controller: 'mainController'
	})
	.when('/add',  {
		templateUrl: 'pages/add-question.html',
		controller: 'addQuestionController'
	})
	.when('/show/:id',  {
		templateUrl: 'pages/show-question.html',
		controller: 'showQuestionController'
	})
});

// FACTORY
// factory, which controling access to the data
myApp.factory('dataFactory', [
	'$resource', function($resource) {
		return $resource('data/:filename.:format', {
			filename: 'answers',
			format: 'json'
		});
	}
]);

// FILTERS
// filtering questions by unanswered and answered
myApp.filter('questionFilter', function() {
	return function(q, filterOn, filterByAnswers) {
		// console.log('questions : ' + q);
		// console.log('filterOn : ' + filterOn);
		// console.log('filterByAnswers : ' + filterByAnswers);
		var positiveArr = q.filter(function(object) {
			// console.log('object : ' + object);
			if(filterOn) {
				if(filterByAnswers) {
				if(!object.answers) return false;	
					return object.answers.length > 0;
				} else {
					if(!object.answers) return true;
					return object.answers.length === 0;
				}
			} else {
				return true;
			}
		});
		return positiveArr;
	}
});

// CONTROLLERS
myApp.controller('mainController', ['$scope', '$log', '$http', '$rootScope', 'dataFactory', function($scope, $log, $http, $rootScope, dataFactory) {
	if($rootScope.questions == undefined)
	{
		dataFactory.get({filename: 'questions'}, function(data){
			$scope.data = data;
			$rootScope.questions = $scope.data.questions;
			// $log.info('DATA :' + $rootScope.questions);
		});
	}
	// filter is off by default
	$scope.filterOn = false;
	$scope.filterByAnswers = false;
}]); 

myApp.controller('addQuestionController', ['$scope', '$log', '$rootScope',function($scope,  $log, $rootScope) {

	$scope.btnAvaliable = true;

	$scope.questionCaption = "";
	$scope.questionBody = "";
	// updating button "add question" depending on caption fill
	$scope.$watch('questionCaption', function() {
		if($scope.questionCaption.length > 0)
		{
			$scope.btnAvaliable = true;
		}
		else 
		{
			$scope.btnAvaliable = false;
		}
	});

	// add new question
	$scope.addNewQuestion = function() {
		// console.log("ADD NEW QUESTION !");
		var newQuestion = {};
		newQuestion.id = $rootScope.questions.length+1;
		$scope.newId = newQuestion.id;
		newQuestion.caption = $scope.questionCaption;
		if($scope.questionBody.length > 0) 
		{
			newQuestion.description = $scope.questionBody;
		}
		else
		{
			newQuestion.description = "";
		}
		$rootScope.questions.push(newQuestion);
	};
}]);

myApp.controller('showQuestionController', ['$scope', '$log', '$routeParams', '$rootScope', '$http', 'dataFactory', function($scope,  $log, $routeParams, $rootScope, $http, dataFactory) {
	$scope.questionId = $routeParams.id;
	var currentQuestion = $rootScope.questions[$routeParams.id-1];
	$scope.caption = currentQuestion.caption;
	$scope.desc = currentQuestion.description;	

	// filger by current question
	$scope.filterAnswers = function() {

		var fits  = [];
		if(currentQuestion.answers ==  undefined) return fits;
		for(var i = 0; i < currentQuestion.answers.length; i++)
		{			
			// $log.info("All answers: " +  currentQuestion.answers);
			var index = currentQuestion.answers[i];
			var cur = $rootScope.allAnswers[index-1];
			fits.push(cur);
		}
		return fits;
	};	

	// get all answers...	
	if($rootScope.allAnswers == undefined)
	{
		// get json data only once in this version
		dataFactory.get({filename: 'answers'}, function(data){
			$scope.data = data;
			$rootScope.allAnswers = $scope.data.answers;
			// $log.info('DATA :' + $scope.allAnswers);
			// ... and filter it by current question
			$scope.answers = $scope.filterAnswers();
		});		
    }
    else
    {
    	// ... and filter it by current question
    	// (if already avaliable)
    	$scope.answers = $scope.filterAnswers();
    }
	
    // sending answer to the current question
	$scope.show = false;
	$scope.sendAnswer = function() {
		if($scope.answerBody.length > 0)
		{
			$scope.myAnswer = {};
			$scope.myAnswer.id = $rootScope.allAnswers.length+1;
			$scope.myAnswer.value = $scope.answerBody;
			if(currentQuestion.answers == undefined) currentQuestion.answers = [];
			currentQuestion.answers.push($scope.myAnswer.id);
			$rootScope.allAnswers.push($scope.myAnswer);
			$scope.answers.push($scope.myAnswer);
			$scope.answerBody = "";
			// $log.info('Send Answer ' + myAnswer.id + " - " + myAnswer.value);
			// $log.info($scope.allAnswers);
		}		
	};	
}]);