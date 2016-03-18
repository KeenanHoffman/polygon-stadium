'use strict';

angular.module('polygonStadiumApp')
  .controller('NavbarController', ['$scope', '$http', '$window', 'jwtHelper', 'userService', navbarController])
  .controller('LoginController', ['$scope', '$http', '$window', loginController])
  .controller('GameController', ['$scope', '$http', '$window', 'jwtHelper', 'userService', gameController])
  .controller('SignupController', ['$scope', '$http', '$window', signupController]);

function navbarController($scope, $http, $window, jwtHelper, userService) {
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
    if(vm.user.id === 'none') {
      $window.location.href = '#/login';
    }
  };
  vm.logout = function() {
    delete $window.sessionStorage.token;
    vm.user = userService.getUser();
    $window.location.href = '#/login';
  };
  vm.playNow = function() {
    $window.location.href = '#/play';
  };
  $scope.$on('$routeChangeStart', function() {
   vm.user = userService.getUser();
 });
}


function loginController($scope, $http, $window) {
  $(document).ready(function() {
    $.material.init();
    $('.dropdown-toggle').dropdown();
  });
  var vm = this;
  vm.user = {};
  vm.login = function() {
    $http.post('http://localhost:3000/auth', vm.user)
      .success(function(data, status, headers, config) {
        $window.sessionStorage.token = data.token;
        $window.location.href = '#/play';
      })
      .error(function(data/*, status, headers, config*/) {
        // Erase the token if the user fails to log in
        delete $window.sessionStorage.token;
        console.log(data);
      });
  };
  vm.signup = function() {
    $window.location.href = '#/signup';
  };
  vm.playNow = function() {
    $window.location.href = '#/play';
  };
}

function gameController($scope, $http, $window, jwtHelper, userService) {
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
        url: 'http://localhost:3000/users/' + user.id + '/saves',
        method: 'GET'
      })
      .success(function(data /*, status, headers, config*/ ) {
        vm.saves = data;
      });
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
}

function signupController($scope, $http, $window) {
  $(document).ready(function() {
    $.material.init();
    $('.dropdown-toggle').dropdown();
  });
  var vm = this;
  vm.newUser = {};
  vm.signup = function() {
    delete vm.newUser.confirmPassword;
    console.log(vm.newUser);
    $http.post('http://localhost:3000/users/new', vm.newUser)
      .success(function(data/*, status, headers, config*/) {
        console.log(data);
        $window.location.href = '#/';
      })
      .error(function(data/*, status, headers, config*/) {
        console.log(data);
      });
  };
  vm.goToLogin = function() {
    $window.location.href = '#/';
  };
}
