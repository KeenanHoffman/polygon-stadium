'use strict';

angular.module('polygonStadiumApp')
  .controller('LoginController', ['$scope', '$http', '$window', loginController])
  .controller('GameController', ['$scope', '$http', gameController]);

function loginController($scope, $http, $window) {
  $(document).ready(function() {
    $.material.init();
    $('.dropdown-toggle').dropdown();
  });
  var vm = this;
  vm.user = {};
  vm.submit = function() {
    $http.post('http://localhost:3000/auth', vm.user)
      .success(function(data, status, headers, config) {
        $window.sessionStorage.token = data.token;
        console.log('success');
      })
      .error(function(data, status, headers, config) {
        // Erase the token if the user fails to log in
        delete $window.sessionStorage.token;
        console.log('error');
      });
  };
}

function gameController($scope, $http) {
  $(document).ready(function() {
    $.material.init();
    $('.dropdown-toggle').dropdown();
  });
  var vm = this;
  $scope.data = {};
  vm.saveChosen = false;
  $http({
      url: 'http://localhost:3000/users/1/saves',
      method: 'GET'
    })
    .success(function(data /*, status, headers, config*/ ) {
      vm.saves = data;
    });
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
