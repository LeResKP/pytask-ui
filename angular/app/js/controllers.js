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
  .controller('MainCtrl', ['$scope', 'Task', 'Project', '$modal', function ($scope, Task, Project, $modal) {
    $scope.tasks = Task.query();
    $scope.projects = Project.query();
    $scope.isActive = function(task) {
        return task.status === ACTIVE_STATUS;
    };
    $scope.disabledActive = function(task) {
        return (task.status === ACTIVE_STATUS || task.status === CLOSED_STATUS);
    };
    $scope.setActive = function($event, task) {
        $event.stopPropagation();
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

    $scope.closeText = function(task) {
        return task.status === CLOSED_STATUS? 'open': 'close';
    };

    $scope.toggleClose = function($event, task) {
        $event.stopPropagation();
        task.$patch({action: 'toggle_close'});
    };

    $scope.$on('addTask', function (event, task) {
        $scope.tasks.push(task);
    });

}]);


pytaskControllers
  .controller('navbarCtrl', ['$scope', 'Task', '$modal',
          function ($scope, Task, $modal) {
            $scope.task = new Task();

            $scope.open = function() {
                $modal.open({
                    templateUrl: 'views/modal-test.html',
                    controller: 'ModalInstanceCtrl',
                });
            };
        }
  ]);


pytaskControllers
  .controller('projectsCtrl', ['$scope', 'Task', 'Project', '$modal', function ($scope, Task, Project) {
    $scope.projects = Project.query();
}]);


pytaskControllers.controller('ModalInstanceCtrl', ['$scope', '$modalInstance', '$rootScope', 'Task', function ($scope, $modalInstance, $rootScope, Task) {

    $scope.task = new Task();

    $scope.ok = function () {
        $scope.task.$save();
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
