'use strict';

angular.module('polygonStadiumApp').service('userService', ['$http', '$window', 'jwtHelper', userServiceLogic]);

function userServiceLogic($http, $window, jwtHelper) {
  return {
    getUser: function() {
      try {
        var user = jwtHelper.decodeToken($window.sessionStorage.token);
        return user;
      } catch (err) {
        return {
          id: 'none',
          username: 'Login'
        };
      }
    },
  };
}
