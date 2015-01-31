'use strict';

var pytaskServices = angular.module('pytaskServices', ['ngResource']);

pytaskServices.factory('Task', ['$resource',
    function($resource){
        return $resource('api/tasks', {}, {
            query: {method:'GET', isArray: true}
        });
    }
]);
