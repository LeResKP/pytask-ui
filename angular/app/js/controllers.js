'use strict';

/**
 * @ngdoc function
 * @name App.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the App
 */
var pytaskControllers = angular.module('pytaskControllers', []);
pytaskControllers
  .controller('MainCtrl', ['$scope', 'Task', function ($scope, Task) {
    $scope.tasks = Task.query();
    $scope.isActive = function(task) {
        return task.status === 'ACTIVE';
    };
}]);


/**
 * @ngdoc function
 * @name App.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the App
 */
pytaskControllers
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
