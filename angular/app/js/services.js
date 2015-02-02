'use strict';

var pytaskServices = angular.module('pytaskServices', ['ngResource']);

pytaskServices.factory('Task', ['$resource',
    function($resource){
        return $resource('api/tasks/:idtask/:action.json',
                {idtask: '@idtask', action: ''},
                {
                    update: {method: 'PUT'},
                    patch: {method: 'PATCH'}
        });
    }
]);


pytaskServices.factory('Project', ['$resource',
    function($resource){
        return $resource('api/projects/:idproject/:action.json',
                {idproject: '@idproject', action: ''},
                {
                    update: {method: 'PUT'},
                    patch: {method: 'PATCH'}
        });
    }
]);



// http://synforge.com/angular-dynamic-alert-dialogs/
pytaskServices.factory('AlertService', function($rootScope, $timeout) {
    var alertService = {};

    // create an array of alerts available globally
    $rootScope.alerts = [];

    alertService.add = function(type, msg) {
        var that = this;
        var d = {'type': type, 'msg': msg, close: function(){that.closeAlert(this);}};
        $rootScope.alerts.push(d);
        $timeout(function() {
            var pos = $rootScope.alerts.indexOf(d);
            that.closeAlert(pos);
        }, 3000);
    };

    alertService.set = function(type, msg) {
        $rootScope.alerts = [];
        this.add(type, msg);
    };

    alertService.closeAlert = function(index) {
        $rootScope.alerts.splice(index, 1);
    };

    return alertService;
});
