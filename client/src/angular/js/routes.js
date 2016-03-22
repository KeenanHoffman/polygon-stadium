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
      activetab: 'signup'
    })
    .when('/profile', {
      templateUrl: '../views/profile.html',
      controller: 'ProfileController as PC',
      activetab: 'profile'
    })
    .when('/leaderboard', {
      templateUrl: '../views/leaderboard.html',
      controller: 'LeaderboardController as LBC',
      activetab: 'leaderboard'
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
