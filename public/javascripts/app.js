/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
/* global angular */

const app = angular.module('angularjsNodejsTutorial', []);

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

// For unknown reasons, Angular breaks if an arrow callback is used here.
app.controller('yearsController', function ($scope, $http) {
  $http({
    url: '/yearTuples',
    method: 'GET',
  }).then((res) => {
    $scope.years = res.data;
  }, (err) => {
    console.log('[!] ', err);
  });
});

// For unknown reasons, Angular breaks if an arrow callback is used here.
app.controller('cardsController', function ($scope, $http) {
  $scope.changedInput = function (indicator, minYear, maxYear) {
    if (!indicator) return;
    if (!indicator.code || indicator.code === '') return;
    if (!minYear || minYear === '') return;
    if (!maxYear || maxYear === '') return;

    $http({
      url: `/cardTuples/${indicator.code}/${minYear}/${maxYear}`,
      method: 'GET',
    }).then((res) => {
      $scope.cards = res.data;
    }, (err) => {
      console.log('[!] ', err);
    });
  };
});

// For unknown reasons, Angular breaks if an arrow callback is used here.
app.controller('graphsController', function ($scope, $http) {
  $scope.changedInput = function (indicator, minYear, maxYear, country) {
    if (!indicator) return;
    if (!indicator.code || indicator.code === '') return;
    if (!minYear || minYear === '') return;
    if (!maxYear || maxYear === '') return;
    if (!country) return;
    if (!country.name || country.name === '') return;

    $http({
      url: `/graphTuples/${indicator.code}/${minYear}/${maxYear}/${country.name}`,
      method: 'GET',
    }).then((res) => {
      $scope.graphs = res.data;
      console.log($scope.graphs);
    }, (err) => {
      console.log('[!] ', err);
    });
  };
});

// For unknown reasons, Angular breaks if an arrow callback is used here.
app.controller('yoyController', function ($scope, $http) {
  $scope.changedInput = function (indicator) {
    if (!indicator) return;
    if (!indicator.code || indicator.code === '') return;

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
  $scope.changedInput = function (indicatorNumerator, indicatorDenominator) {
    if (!indicatorNumerator) return;
    if (!indicatorNumerator.code || indicatorNumerator.code === '') return;
    if (!indicatorDenominator) return;
    if (!indicatorDenominator.code || indicatorDenominator.code === '') return;

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
