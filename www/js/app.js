(function () {
  "use strict";

  var app = angular.module('app', [
    'ngCordova',
    'ionic',
    'firebase',
    'app.providers',
    'app.services',
    'app.factories',
    'app.controllers'
  ]);

  app.config([
    '$stateProvider',
    '$urlRouterProvider',
    'FirebaseServiceProvider',
    function ($stateProvider, $urlRouterProvider, FirebaseServiceProvider) {

      FirebaseServiceProvider.setBaseUrl('https://resplendent-fire-6403.firebaseio.com');

      $stateProvider
        .state('item-list', {
          url: "/",
          templateUrl: "./templates/item-list.html",
          controller: 'ItemListScreenCtrl'
        })
        .state('room-manifest', {
          url: '/room/:name',
          templateUrl: "./templates/room-manifest.html",
          controller: 'RoomManifestScreenCtrl'
        });

      // if none of the above states are matched, use this as the fallback
      $urlRouterProvider.otherwise('/');

    }
  ]);

  app.run([
    '$window',
    '$ionicPlatform',
    '$rootScope',
    '$state',
    function ($window, $ionicPlatform, $rootScope, $state) {

      $ionicPlatform.ready(function () {
        if ($window.StatusBar) {
          StatusBar.styleDefault();
        }
        console.log("Ionic is ready.");
      });

    }
  ]);

})();
