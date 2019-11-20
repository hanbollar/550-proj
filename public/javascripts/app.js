/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
/* global angular */

const app = angular.module('angularjsNodejsTutorial', []);

// TODO: Fix these controllers.

// For unknown reasons, Angular breaks if an arrow callback is used here.
app.controller('cardsController', function ($scope, $http, $attrs) {
  console.log($attrs);

  if (!$attrs.indicator) throw new Error('[!] cardsController missing argument: indicator');
  if (!$attrs.minYear) throw new Error('[!] cardsController missing argument: minYear');
  if (!$attrs.maxYear) throw new Error('[!] cardsController missing argument: maxYear');

  $http({
    url: `/cardTuples/${$attrs.indicator}/${$attrs.minYear}/${$attrs.maxYear}`,
    method: 'GET',
  }).then((res) => {
    $scope.countries = res.data;
  }, (err) => {
    console.log('[!] Cards controller: ', err);
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
    console.log('[!] Graphs controller: ', err);
  });
});

// For unknown reasons, Angular breaks if an arrow callback is used here.
app.controller('factsController', function ($scope, $http, $attrs) {
  $http({
    url: '/indicatorTuples',
    method: 'GET',
  }).then((res) => {
    $scope.indicators = res.data;
  }, (err) => {
    console.log('[!] Facts controller: ', err);
  });

  if (!$attrs.yoyIndicator) throw new Error('[!] factsController missing argument: yoyIndicator');

  $http({
    url: `/yoyTuples/${$attrs.indicator}`,
    method: 'GET',
  }).then((res) => {
    $scope.yoys = res.data;
  }, (err) => {
    console.log('[!] Facts controller: ', err);
  });
});
