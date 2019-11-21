/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
/* global angular */

const app = angular.module('angularjsNodejsTutorial', []);

// TODO: Fix these controllers.

// For unknown reasons, Angular breaks if an arrow callback is used here.
app.controller('cardsController', function ($scope, $http, $attrs) {
  if (!$attrs.indicator) throw new Error('[!] Missing argument');
  if (!$attrs.minYear) throw new Error('[!] Missing argument');
  if (!$attrs.maxYear) throw new Error('[!] Missing argument');

  $http({
    url: `/cardTuples/${$attrs.indicator}/${$attrs.minYear}/${$attrs.maxYear}`,
    method: 'GET',
  }).then((res) => {
    $scope.countries = res.data;
  }, (err) => {
    console.log('[!] ', err);
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
    console.log('[!] ', err);
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
    console.log('[!] ', err);
  });
});

// For unknown reasons, Angular breaks if an arrow callback is used here.
app.controller('yoyController', function ($scope, $http) {
  $scope.changedIndicator = function (indicator) {
    if (!indicator) throw new Error('[!] Missing argument');
    if (!indicator.code) throw new Error('[!] Missing argument');

    $http({
      url: `/yoyTuples/${indicator.code}`,
      method: 'GET',
    }).then((res) => {
      $scope.yoys = res.data;
    }, (err) => {
      console.log('[!] ', err);
    });
  };
});

app.controller('yoyPairController', function ($scope, $http) {
  $scope.changedIndicators = function (indicatorNumerator, indicatorDenominator) {
    if (!indicatorNumerator) throw new Error('[!] Missing argument');
    if (!indicatorNumerator.code) throw new Error('[!] Missing argument');
    if (!indicatorDenominator) throw new Error('[!] Missing argument');
    if (!indicatorDenominator.code) throw new Error('[!] Missing argument');

    $http({
      url: `/yoyPairTuples/${indicatorNumerator.code}/${indicatorDenominator.code}`,
      method: 'GET',
    }).then((res) => {
      $scope.yoyPairs = res.data;
    }, (err) => {
      console.log('[!] ', err);
    });
  };
});
