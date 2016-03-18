'use strict';

angular.module('polygonStadiumApp').config(function($routeProvider, $locationProvider) {
  $routeProvider
    .when('/', {
      templateUrl: '../views/home.html',
      controller: 'LoginController as LC',
      activetab: 'home'
    })
    .when('/signup', {
      templateUrl: '../views/signup.html',
      controller: 'SignupController as SC',
      activetab: 'material'
    })
    .when('/material', {
      templateUrl: '../views/material.html',
      controller: 'LoginController as TC',
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
