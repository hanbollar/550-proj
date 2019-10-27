/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
/* global angular */

const app = angular.module('angularjsNodejsTutorial', []);

// For unknown reasons, Angular breaks if an arrow callback is used here.
app.controller('cardsController', function ($scope, $http) {
  $http({
    url: '/countries',
    method: 'GET',
  }).then((res) => {
    $scope.countries = res.data;
  }, (err) => {
    console.log('[!] Cards controller: ', err);
  });
});
