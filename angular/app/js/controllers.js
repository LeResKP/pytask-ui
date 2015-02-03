'use strict';


var ACTIVE_STATUS = 'ACTIVE';
var CLOSED_STATUS = 'CLOSED';


var httpErrorToString = function(httpResponse) {
    return httpResponse.status + ' ' + httpResponse.statusText + ': ' + httpResponse.data.msg;
};

/**
 * @ngdoc function
 * @name App.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the App
 */
var pytaskControllers = angular.module('pytaskControllers', []);

pytaskControllers
  .controller('MainCtrl', ['$scope', '$modal', 'Task', 'Project', function ($scope, $modal, Task, Project) {
    $scope.tasks = Task.query();
    $scope.projects = Project.query();
    $scope.isActive = function(task) {
        return task.status === ACTIVE_STATUS;
    };
    $scope.disabledActive = function(task) {
        return (task.status === CLOSED_STATUS);
    };

    $scope.activeText = function(task) {
        return task.status === ACTIVE_STATUS? 'Stop': 'Start';
    };

    $scope.toggleActive = function($event, task) {
        $event.stopPropagation();
        task.$patch({action: 'toggle_active'}, function(){
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

    $scope.closeText = function(task) {
        return task.status === CLOSED_STATUS? 'open': 'close';
    };

    $scope.toggleClose = function($event, task) {
        $event.stopPropagation();
        task.$patch({action: 'toggle_close'});
    };

    $scope.modalTask = function($event, task) {
        console.log('edit', task);
        $event.stopPropagation();
        $modal.open({
            templateUrl: 'views/modal-test.html',
            controller: 'ModalInstanceCtrl',
            resolve: {
                task: function () {
                   return task;
               }
            }
        });
    };

    $scope.$on('addTask', function (event, task) {
        if (typeof task.idtask === 'undefined') {
            $scope.tasks.push(task);
        }
    });

}]);


pytaskControllers
  .controller('navbarCtrl', ['$scope', 'Task', '$modal',
          function ($scope, Task, $modal) {
            $scope.open = function() {
                $modal.open({
                    templateUrl: 'views/modal-test.html',
                    controller: 'ModalInstanceCtrl',
                    resolve: {
                        task: function() {
                            return new Task();
                        }
                    }
                });
            };
        }
  ]);


pytaskControllers
  .controller('projectsCtrl', ['$scope', 'Task', 'Project', '$modal', function ($scope, Task, Project) {
    $scope.projects = Project.query();
}]);


pytaskControllers.controller('ModalInstanceCtrl', ['$scope', '$modalInstance', '$rootScope', 'Task', 'Project', 'task', function ($scope, $modalInstance, $rootScope, Task, Project, task) {

    $scope.task = task;
    $scope.projects = Project.query();

    $scope.ok = function () {
        if (typeof $scope.task.idtask === 'undefined') {
            $scope.task.$save();
        }
        else {
            $scope.task.$update();
        }
        $rootScope.$broadcast('addTask', $scope.task);
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}]);



var apiController = function($scope, $routeParams, AlertService, Cls, pk, name) {

    var isNew = ($routeParams[pk] === 'new');
    if (!isNew) {
        console.log('id', $routeParams[pk]);
        console.log('cls', Cls);
        console.log('pk', pk);
        var o = {};
        o[pk] = $routeParams[pk];
        $scope[name] = Cls.get(o);
    }
    else {
        $scope[name] = new Cls();
    }

    $scope.updateObject = function(obj) {
        if ($scope[name+'Form'].$valid) {
            if (obj[pk]) {
                obj.$update(function() {
                    AlertService.set('success', name + ' updated!');
                }, function(httpResponse) {
                    console.log(httpResponse);
                    var error = httpErrorToString(httpResponse);
                    AlertService.set('danger', 'An error occured when updating '+name+':' + error);
                });
            }
            else {
                obj.$save(function() {
                    AlertService.set('success', name + ' created!');
                }, function(httpResponse) {
                    var error = httpErrorToString(httpResponse);
                    AlertService.set('danger', 'An error occured when creating '+name+': ' + error);
                });
            }
        }
    };
};

/**
 * @ngdoc function
 * @name App.controller:taskCtrl
 * @description
 * # taskCtrl
 * Controller of the App
 */
pytaskControllers
  .controller('taskCtrl', ['$scope', '$routeParams', 'AlertService', 'Task', 'Project', function ($scope, $routeParams, AlertService, Task, Project) {
    $scope.projects = Project.query();
    apiController($scope, $routeParams, AlertService, Task, 'idtask', 'task');

}]);


pytaskControllers
  .controller('projectCtrl', ['$scope', '$routeParams', 'AlertService', 'Project', function ($scope, $routeParams, AlertService, Project) {
    apiController($scope, $routeParams, AlertService, Project, 'idproject', 'project');
}]);


var app = angular
  .module('pytaskFilter', []);
app.filter('taskStatusFilter', function () {
    return function (tasks, stat) {
        if (stat === 'all') {
            return tasks;
        }

        if (typeof stat === 'undefined' || stat === '') {
            stat = 'open';
        }

        var filtered = [];
        for (var i = 0; i < tasks.length; i++) {
            var task = tasks[i];
            // HACK: in waiting we add the model, set empty status to open
            var s = task.status || 'open';
            if(task.status === 'ACTIVE') {
                // Active task is consider as open
                s = 'open';
            }
            if (s === stat) {
                filtered.push(task);
            }
        }
        return filtered;
    };
});
