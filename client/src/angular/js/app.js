'use strict';

angular.module('polygonStadiumApp', ['ngRoute']).config(function ($httpProvider) {
  $httpProvider.interceptors.push('authInterceptor');
});
