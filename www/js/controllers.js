(function () {
  "use strict";

  var controllers = angular.module('app.controllers', [
    'app.providers'
  ]);

  controllers.controller('ItemListScreenCtrl', [
    '$scope',
    '$firebase',
    'FirebaseService',
    '$ionicModal',
    '$ionicListDelegate',
    function ($scope, $firebase, FirebaseService, $ionicModal, $ionicListDelegate) {

      var sync = $firebase(FirebaseService.atPath('/items'));

      $scope.itemsByRoom = {};
      $scope.rooms = [];
      $scope.mode = 'items';
      $scope.deleteMode = false;
      $scope.modalData = {};

      $ionicModal.fromTemplateUrl('./templates/item-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.itemModal = modal;
      });

      var computeLists = function () {
        $scope.itemsByRoom = _.groupBy($scope.items, 'room');

        $scope.rooms = _.chain($scope.items).
                         map(function (i) { return i.room; } ).
                         uniq().
                         value();

      };
      this.computeLists = computeLists; // Exposing to test...

      var itemArraySync = sync.$asArray();
      itemArraySync.$loaded().then(computeLists);
      itemArraySync.$watch(computeLists);
      $scope.items = itemArraySync;

      $scope.switchDeleteMode = function () {
        $scope.mode = 'items';

        $scope.deleteMode = !$scope.deleteMode;
      };

      $scope.openAddItemModal = function () {
        $scope.mode = 'items';

        $scope.modalData = {
          type: 'Add',
          title: 'Add Item',
          item: {}
        };
        $scope.itemModal.show();
      };

      $scope.openEditItemModal = function (item) {
        $scope.modalData = {
          type: 'Edit',
          title: 'Edit ' + item.title,
          item: item
        };
        $scope.itemModal.show();
      };

      $scope.closeItemModal = function () {
        $scope.itemModal.hide();
      };

      $scope.submitItemFromModal = function (modalType, item) {
        if (modalType == "Add") {
          itemArraySync.$add(item).then(function (ref) {
            $scope.itemModal.hide();
          });
        } else { // "Edit"
          itemArraySync.$save(item).then(function (ref) {
            $scope.itemModal.hide();
          });
        }
      };

      $scope.removeItem = function (item, roomName, index) {
        itemArraySync.$remove(item).then(function (ref) {

        });
      };

    }
  ]);

  controllers.controller('RoomManifestScreenCtrl', [
    '$scope',
    '$stateParams',
    '$firebase',
    'FirebaseService',
    function ($scope, $stateParams, $firebase, FirebaseService) {
      var currentRoomName = $stateParams.name;

      var sync = $firebase(FirebaseService.atPath('/items'));
      var itemArraySync = sync.$asArray();
      $scope.items = itemArraySync;

      $scope.currentRoomName = currentRoomName;
      $scope.heaviestItems = [];
      $scope.fragileItems = [];
      $scope.allOtherItems = [];

      var computeLists = function () {
        var itemsOfRoom = _.chain($scope.items);
        if (currentRoomName) {
          var byRoom = function (roomName) {
            return function (i) {
              return i.room === roomName;
            };
          };
          itemsOfRoom = itemsOfRoom.filter(byRoom(currentRoomName));
        }

        // Get the two heaviest items.
        var heaviestItems = itemsOfRoom.sortBy(function (i) {
          var weight = parseFloat(i.weight);
          return -weight; // Altered the order of the sort.
        }).first(2).value();

        // Get the fragileItems.
        var fragileItems = itemsOfRoom.filter(function (i) {
          return i.is_fragile;
        }).value();

        // Get all of the other items that are not heavy and are not fragile.
        var allOtherItems = itemsOfRoom.filter(function (i) {
          var isAlreadyInList = (fragileItems.indexOf(i) !== -1 ||
                                 heaviestItems.indexOf(i) !== -1);
          return !isAlreadyInList;
        }).value();

        $scope.heaviestItems = heaviestItems;
        $scope.fragileItems = fragileItems;
        $scope.allOtherItems = allOtherItems;
      };
      this.computeLists = computeLists; // Exposing to test...

      itemArraySync.$loaded().then(computeLists);
    }
  ]);

})();
