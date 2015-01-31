'use strict';


var ACTIVE_STATUS = 'ACTIVE';

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
        return task.status === ACTIVE_STATUS;
    };
    $scope.setActive = function(task) {
        task.$update({action: 'active'}, function(){
            // Remove the active task
            for(var i=0, len=$scope.tasks.length; i < len; i++) {
                var t = $scope.tasks[i];
                if (t.idtask !== task.idtask && t.status === ACTIVE_STATUS) {
                    t.status = '';
                    break;
                }
            }
        });
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
