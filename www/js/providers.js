(function () {
  "use strict";

  var providers = angular.module('app.providers', ['firebase']);

  providers.provider('FirebaseService', [function () {

    var baseUrl = "https://example.firebaseio.com";

    this.setBaseUrl = function (newUrl) {
      baseUrl = newUrl;
    };

    this.getBaseUrl = function () {
      return baseUrl;
    };

    this.$get = function () {
      return {
        atPath: function atPath(path) {
            return new Firebase(baseUrl + path);
        }
      };
    };

  }]);

})();
