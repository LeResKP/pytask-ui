'use strict';

/**
 * @ngdoc overview
 * @name App
 * @description
 * # App
 *
 * Main module of the application.
 */
angular
  .module('pytaskApp', [
    'ngAnimate',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ui.bootstrap',
    'pytaskControllers',
    'pytaskServices'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/tasks', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/tasks/:idtask', {
        templateUrl: 'views/task.html',
        controller: 'taskCtrl'
      })
      .when('/projects', {
        templateUrl: 'views/projects.html',
        controller: 'projectsCtrl'
      })
      .when('/projects/:idproject', {
        templateUrl: 'views/project.html',
        controller: 'projectCtrl'
      })
      .otherwise({
        redirectTo: '/tasks'
      });
  });
