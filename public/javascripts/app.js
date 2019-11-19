/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
/* global angular */

const app = angular.module('angularjsNodejsTutorial', []);

// TODO: Fix these controllers.

// For unknown reasons, Angular breaks if an arrow callback is used here.
app.controller('cardsController', function ($scope, $http) {
  $http({
    url: '/cardTuples',
    method: 'POST',
  }).then((res) => {
    $scope.countries = res.data;
  }, (err) => {
    console.log('[!] Cards controller: ', err);
  });
});

// For unknown reasons, Angular breaks if an arrow callback is used here.
app.controller('indicatorsController', function ($scope, $http) {
  $http({
    url: '/indicatorTuples',
    method: 'GET',
  }).then((res) => {
    $scope.indicators = res.data;
  }, (err) => {
    console.log('[!] Indicators controller: ', err);
  });
});

// For unknown reasons, Angular breaks if an arrow callback is used here.
app.controller('graphsController', function ($scope, $http) {
  $http({
    url: '/graphTuples',
    method: 'POST',
  }).then((res) => {
    $scope.indicators = res.data;
  }, (err) => {
    console.log('[!] Graph controller: ', err);
  });
});
