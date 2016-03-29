'use strict';

angular.module('polygonStadiumApp')
  .controller('NavbarController', ['$scope', '$http', '$window', 'jwtHelper', 'userService', '$route', navbarController])
  .controller('LoginController', ['$scope', '$http', '$window', "apiUrl", loginController])
  .controller('ProfileController', ['$scope', '$http', '$window', 'userService', "apiUrl", profileController])
  .controller('GameController', ['$scope', '$http', '$window', 'jwtHelper', 'userService', '$compile', "apiUrl", gameController])
  .controller('SignupController', ['$scope', '$http', '$window', "apiUrl", signupController])
  .controller('LeaderboardController', ['$scope', '$http', "apiUrl", leaderboardController]);

function navbarController($scope, $http, $window, jwtHelper, userService, $route) {
  $(document).ready(function() {
    $.material.init();
    $('.dropdown-toggle').dropdown();
  });
  var vm = this;
  vm.user = userService.getUser();
  vm.goToSignup = function() {
    $window.location.href = '#/signup';
  };
  vm.goToLogin = function() {
    if (vm.user.id === 'none') {
      $window.location.href = '#/';
    }
  };
  vm.goHome = function() {
    if (vm.user.id === 'none') {
      $window.location.href = '#/';
    } else {
      $window.location.href = '#/play';
      $route.reload();
    }
  };
  vm.goToProfile = function() {
    $window.location.href = '#/profile';
  };
  vm.logout = function() {
    delete $window.sessionStorage.token;
    vm.user = userService.getUser();
    $window.location.href = '#/';
  };
  vm.playNow = function() {
    $window.location.href = '#/play';
    $route.reload();
  };
  vm.goToLeaderboard = function() {
    $window.location.href = '#/leaderboard';
  };
  $scope.$on('$routeChangeStart', function() {
    vm.user = userService.getUser();
  });
}


function loginController($scope, $http, $window, apiUrl) {
  $(document).ready(function() {
    $.material.init();
    $('.dropdown-toggle').dropdown();
  });
  var vm = this;
  vm.user = {};
  vm.login = function() {
    $http.post(apiUrl + 'auth', vm.user)
      .success(function(data /*, status, headers, config*/ ) {
        $window.sessionStorage.token = data.token;
        $window.location.href = '#/play';
      })
      .error(function(data /*, status, headers, config*/ ) {
        // Erase the token if the user fails to log in
        delete $window.sessionStorage.token;
        vm.message = data.status;
        vm.success = false;
      });
  };
  vm.signup = function() {
    $window.location.href = '#/signup';
  };
  vm.playNow = function() {
    $window.location.href = '#/play';
  };
}

function profileController($scope, $http, $window, userService, apiUrl) {
  $(document).ready(function() {
    $.material.init();
    $('.dropdown-toggle').dropdown();
  });
  var vm = this;
  vm.user = userService.getUser();

  //Use a set timeout to aviod $digest errors -
  // "...when the application's model becomes unstable and each $digest cycle triggers a state
  // change and subsequent $digest cycle. Angular detects this situation and prevents an infinite loop from
  // causing the browser to become unresponsive."
  setTimeout(function() {
    if (vm.user.id === 'none') {
      $window.location.href = '#/';
    }
  }, 0);
  vm.update = function() {
    if (vm.updatedUser.newPassword) {
      vm.updatedUser.password = vm.updatedUser.newPassword;
      delete vm.updatedUser.newPassword;
      delete vm.updatedUser.confirmPassword;
    }
    if (!vm.updatedUser.newPassword &&
      !vm.updatedUser.email &&
      !vm.updatedUser.username) {
      vm.message = 'No Changes Where Submitted';
      vm.success = false;
    } else {
      $http.put(apiUrl + 'users/' + vm.user.id, {
          username: vm.updatedUser.username,
          email: vm.updatedUser.email,
          password: vm.updatedUser.password,
          currentPassword: vm.updatedUser.currentPassword
        })
        .success(function(data /*, status, headers, config*/ ) {
          $window.sessionStorage.token = data.token;
          vm.user = userService.getUser();
          vm.message = 'Your Profile Has Been Updated';
          vm.success = true;
        })
        .error(function(data /*, status, headers, config*/ ) {
          vm.message = data.status;
          vm.success = false;
        });
    }
  };
}

function gameController($scope, $http, $window, jwtHelper, userService, $compile, apiUrl) {
  $(document).ready(function() {
    $.material.init();
    $('.dropdown-toggle').dropdown();
  });
  var vm = this;

  $scope.data = {};
  vm.saveChosen = false;
  var user = userService.getUser();
  if (user.id !== 'none') {
    $http({
        url: apiUrl + 'users/' + user.id + '/saves',
        method: 'GET'
      })
      .success(function(data /*, status, headers, config*/ ) {
        vm.saves = data;
      });
      // .error(function(data) {
      //   console.log(data);
      // });
  }
  vm.chooseSave = function(save, index) {
    if (save === 'new') {
      $scope.save = 'new';
      vm.saveId = index;
      vm.saves = [];
    } else {
      $scope.save = save;
      vm.saveId = vm.saves.length + 1;
      vm.saves = [];
    }
    vm.saveChosen = true;
  };
  $scope.$on('$routeChangeStart', function() {
    $(document).off();
    $('.game-placeholder').empty();
  });
  vm.deleteGame = function(save, index, $event) {
    $event.stopPropagation();
    var shouldDelete = $window.confirm('Deleting a game will remove it from the leaderboard.\nAre you sure you would like to delete this game?');
    if(shouldDelete) {
      $http.delete(apiUrl + 'users/delete-game/' + save.id).success(function() {
        vm.saves.splice(index, 1);
      });
    }
  };
}

function signupController($scope, $http, $window, apiUrl) {
  $(document).ready(function() {
    $.material.init();
    $('.dropdown-toggle').dropdown();
  });
  var vm = this;
  vm.newUser = {};
  vm.signup = function() {
    delete vm.newUser.confirmPassword;
    $http.post(apiUrl + 'users/new', vm.newUser)
      .success(function(data /*, status, headers, config*/ ) {
        $window.location.href = '#/';
      })
      .error(function(data /*, status, headers, config*/ ) {
        vm.message = data.status;
        vm.success = false;
      });
  };
  vm.goToLogin = function() {
    $window.location.href = '#/';
  };
}

function leaderboardController($scope, $http, apiUrl) {
  $(document).ready(function() {
    $.material.init();
    $('.dropdown-toggle').dropdown();
  });
  var vm = this;
  $http.get(apiUrl + 'leaderboard')
    .success(function(scores) {
      vm.leaderboard = scores;
    });
}
