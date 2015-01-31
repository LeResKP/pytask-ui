'use strict';

var pytaskServices = angular.module('pytaskServices', ['ngResource']);

pytaskServices.factory('Task', ['$resource',
    function($resource){
        return $resource('api/tasks/:idtask/:action.json', {idtask: '@idtask', action: ''}, {
            query: {method:'GET', isArray: true},
            update: {method:'POST'}

        });
    }
]);
