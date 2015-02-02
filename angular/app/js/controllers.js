'use strict';


var ACTIVE_STATUS = 'ACTIVE';


var httpErrorToString = function(httpResponse) {
    return httpResponse.status + ' ' + httpResponse.statusText + ': ' + httpResponse.data.msg;
}

/**
 * @ngdoc function
 * @name App.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the App
 */
var pytaskControllers = angular.module('pytaskControllers', []);
pytaskControllers
  .controller('MainCtrl', ['$scope', 'Task', 'Project', function ($scope, Task, Project) {
    $scope.tasks = Task.query();
    $scope.projects = Project.query();
    $scope.isActive = function(task) {
        return task.status === ACTIVE_STATUS;
    };
    $scope.setActive = function(task) {
        task.$patch({action: 'active'}, function(){
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
  .controller('taskCtrl', ['$scope', '$routeParams', 'AlertService', 'Task', 'Project', function ($scope, $routeParams, AlertService, Task, Project) {
    var isNew = ($routeParams.idtask === 'new');
    if (!isNew) {
        $scope.task = Task.get({idtask: $routeParams.idtask});
    }
    else {
        $scope.task = new Task();
    }

    $scope.projects = Project.query();

    $scope.updateTask = function(task) {
        if ($scope.taskForm.$valid) {
            if (task.idtask) {
                task.$update(function() {
                    AlertService.set('success', 'Task updated!');
                }, function(httpResponse) {
                    console.log(httpResponse);
                    var error = httpErrorToString(httpResponse);
                    AlertService.set('danger', 'An error occured when updating task:' + error);
                });
            }
            else {
                task.$save(function() {
                    AlertService.set('success', 'Task created!');
                }, function(httpResponse) {
                    var error = httpErrorToString(httpResponse);
                    AlertService.set('danger', 'An error occured when creating task: ' + error);
                });
            }
        }
    };
}]);


pytaskControllers
  .controller('projectCtrl', ['$scope', '$routeParams', 'AlertService', 'Project', function ($scope, $routeParams, AlertService, Project) {
    var isNew = ($routeParams.idproject === 'new');
    if (!isNew) {
        $scope.project = Project.get({idproject: $routeParams.idproject});
    }
    else {
        $scope.project = new Project();
    }
    $scope.updateProject = function(project) {
        if ($scope.projectForm.$valid) {
            if (project.idproject) {
                project.$update(function() {
                    AlertService.set('success', 'Projects updated!');
                }, function(httpResponse) {
                    var error = httpErrorToString(httpResponse);
                    AlertService.set('danger', 'An error occured when updating project: ' + error);
                });
            }
            else {
                project.$save(function() {
                    AlertService.set('success', 'Project created!');
                }, function(httpResponse) {
                    var error = httpErrorToString(httpResponse);
                    AlertService.set('danger', 'An error occured when creating project: ' + error);
                });
            }
        }
    };
}]);
