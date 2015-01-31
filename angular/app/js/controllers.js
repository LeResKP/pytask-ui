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
        task.$save({action: 'active'}, function(){
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
 * @name App.controller:taskCtrl
 * @description
 * # taskCtrl
 * Controller of the App
 */
pytaskControllers
  .controller('taskCtrl', ['$scope', '$routeParams', 'Task', function ($scope, $routeParams, Task) {
    var isNew = ($routeParams.idtask === 'new');
    if (!isNew) {
        $scope.task = Task.get({idtask: $routeParams.idtask});
    }
    else {
        $scope.task = new Task();
    }
    $scope.updateTask = function(task) {
        if ($scope.task_form.$valid) {
            if (task.idtask) {
                task.$save();
            }
            else {
                task.$save({action: 'new'});
            }
        }
    };
}]);
