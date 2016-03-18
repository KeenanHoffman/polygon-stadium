'use strict';

angular.module('polygonStadiumApp', ['ngRoute', 'angular-jwt']).config(function ($httpProvider) {
  $httpProvider.interceptors.push('authInterceptor');
});
