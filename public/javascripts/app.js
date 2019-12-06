/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
/* global angular */

const app = angular.module('angularjsNodejsTutorial', []);

// Angular breaks if an arrow callback is used here.
app.controller('indicatorsController', function ($scope, $http) {
  $http({
    url: '/indicatorTuples',
    method: 'GET',
  }).then((res) => {
    $scope.indicators = res.data;
  }, (err) => {
    console.log('[!] ', err);
  });
});

// Angular breaks if an arrow callback is used here.
app.controller('countriesController', function ($scope, $http) {
  $http({
    url: '/countryTuples',
    method: 'GET',
  }).then((res) => {
    $scope.countries = res.data;
  }, (err) => {
    console.log('[!] ', err);
  });
});
