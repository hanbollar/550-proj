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
app.controller('yoyController', function ($scope, $http, $attrs) {
  if (!$attrs.indicator) throw new Error('[!] yoyController missing argument: indicator');

  $http({
    url: `/yoyTuples/${$attrs.indicator}`,
    method: 'GET',
  }).then((res) => {
    $scope.yoys = res.data;
  }, (err) => {
    console.log('[!] Yoy controller: ', err);
  });
});

// For unknown reasons, Angular breaks if an arrow callback is used here.
app.controller('yoyPairController', function ($scope, $http, $attrs) {
  if (!$attrs.indicatorNumerator) throw new Error('[!] yoyPairController missing argument: indicatorNumerator');
  if (!$attrs.indicatorDenominator) throw new Error('[!] yoyPairController missing argument: indicatorDenominator');

  $http({
    url: `/yoyPairTuples/${$attrs.indicatorNumerator}/${$attrs.indicatorDenominator}`,
    method: 'GET',
  }).then((res) => {
    $scope.yoyPairs = res.data;
  }, (err) => {
    console.log('[!] Yoy pair controller: ', err);
  });
});
