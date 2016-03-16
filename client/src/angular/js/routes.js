'use strict';

angular.module('polygonStadiumApp').config(function($routeProvider, $locationProvider) {
  $routeProvider
    .when('/', {
      templateUrl: '../views/home.html',
      controller: 'LoginController as LC',
      activetab: 'home'
    })
    .when('/material', {
      templateUrl: '../views/material.html',
      controller: 'TemplateController as TC',
      activetab: 'material'
    })
    .when('/play', {
      templateUrl: '../views/game.html',
      controller: 'GameController as GC',
      activetab: 'play'
    })
    .otherwise({
        redirectTo : "/"
    });
});
