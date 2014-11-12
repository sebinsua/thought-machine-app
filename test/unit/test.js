describe('FirebaseServiceProvider', function () {

  var provider, service;
  beforeEach(function () {
    module('app.providers', function (FirebaseServiceProvider) {
      provider = FirebaseServiceProvider;
    });

    inject(function (FirebaseService) {
      service = FirebaseService;
    });
  });

  it('should exist', function () {
    expect(provider).toBeDefined();
  });

  it('should be able to create services', function() {
    expect(service).toBeDefined();
  });

  it('should be able to set and get a base url', function () {
    expect(provider.setBaseUrl).toBeDefined();

    provider.setBaseUrl('http://unit-testing.firebaseio.com');
    expect(provider.getBaseUrl()).toEqual('http://unit-testing.firebaseio.com');
  });

});

describe('ItemListScreenCtrl', function () {

  beforeEach(module('app'));
  beforeEach(module('app.controllers'));

  var controller, scope;
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    controller = $controller('ItemListScreenCtrl', {
      $scope: scope
    });
  }));

  it('should exist', function () {
    expect(controller).toBeDefined();
  });

  it('should set defaults', function () {
    expect(scope.itemsByRoom).toEqual({});
    expect(scope.rooms).toEqual([]);
    expect(scope.mode).toEqual('items');
    expect(scope.deleteMode).toEqual(false);
    expect(scope.modalData).toEqual({});
  });

  it('should switch delete mode', function () {
    expect(scope.deleteMode).toEqual(false);
    scope.switchDeleteMode();
    expect(scope.deleteMode).toEqual(true);
  });

  it('should be able to compute items into extra lists', function () {
    scope.items = [
      {
        title: "Item",
        room: "Fake Room"
      },
      {
        title: "Item 2",
        room: "Fake Room"
      },
      {
        title: "Item 3",
        room: "Fake Room 2"
      }
    ];
    controller.computeLists();

    expect(scope.itemsByRoom).toEqual({
      "Fake Room" : [
        { title : 'Item', room : 'Fake Room' },
        { title : 'Item 2', room : 'Fake Room' }
      ],
      "Fake Room 2": [
        { title : 'Item 3', room : 'Fake Room 2' }
      ]
    });
    expect(scope.rooms).toEqual(['Fake Room', 'Fake Room 2']);
  });

});

describe('RoomManifestScreenCtrl', function () {

  beforeEach(module('app'));
  beforeEach(module('app.controllers'));

  var controller, scope;
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    controller = $controller('RoomManifestScreenCtrl', {
      $scope: scope
    });
  }));

  it('should exist', function () {
    expect(controller).toBeDefined();
  });

  it('should set defaults', function () {
    expect(scope.currentRoomName).toEqual(null);
    expect(scope.heaviestItems).toEqual([]);
    expect(scope.fragileItems).toEqual([]);
    expect(scope.allOtherItems).toEqual([]);
  });

  it('should be able to compute items into extra lists', function () {
    scope.items = [
      {
        title: "Item",
        room: "Fake Room",
        weight: 25.6,
        is_fragile: true
      },
      {
        title: "Item 2",
        room: "Fake Room",
        weight: 10,
        is_fragile: false
      },
      {
        title: "Item 3",
        room: "Fake Room 2",
        weight: 42.2,
        is_fragile: false
      },
      {
        title: "Item 4",
        room: "Fake Room",
        weight: 1,
        is_fragile: true
      },
    ];
    controller.computeLists();

    expect(scope.heaviestItems).toEqual([
      { title : 'Item 3', room : 'Fake Room 2', weight: 42.2, is_fragile: false },
      { title : 'Item', room : 'Fake Room', weight: 25.6, is_fragile: true }
    ]);
    expect(scope.fragileItems).toEqual([
      { title : 'Item', room : 'Fake Room', weight: 25.6, is_fragile: true },
      { title : 'Item 4', room : 'Fake Room', weight: 1, is_fragile: true },
    ]);
    expect(scope.allOtherItems).toEqual([
      { title : 'Item 2', room : 'Fake Room', weight: 10, is_fragile: false }
    ]);


  });

});
