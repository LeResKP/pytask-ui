'use strict';

var apiFactory = function(pk, prefix, $resource) {
    return $resource(
        'api/' + prefix + '/:'+pk+'/:action.json',
        {idtask: '@' + pk, action: ''},
        {
            update: {method: 'PUT'},
            patch: {method: 'PATCH'}
        }
    );
};



var pytaskServices = angular.module('pytaskServices', ['ngResource']);

pytaskServices.factory('Task', ['$resource',
    function($resource){
        return apiFactory('idtask', 'tasks', $resource);
    }
]);


pytaskServices.factory('Project', ['$resource',
    function($resource){
        return apiFactory('idproject', 'projects', $resource);
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
