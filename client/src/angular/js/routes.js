'use strict';

angular.module('polygonStadiumApp').config(function($routeProvider, $locationProvider) {
  $routeProvider
    .when('/', {
      templateUrl: '../views/home.html',
      controller: 'TemplateController as TC',
      activetab: 'home'
    })
    .when('/material', {
      templateUrl: '../views/material.html',
      controller: 'TemplateController as TC',
      activetab: 'material'
    })
    .when('/play', {
      templateUrl: '../views/game.html',
      controller: 'TemplateController as TC',
      activetab: 'play'
    })
    .otherwise({
        redirectTo : "/"
    });
});
