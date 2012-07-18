'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
app.factory('socket', function ($rootScope) {
  var socket = io.connect();
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {  
        callback.apply(socket, arguments);
        $rootScope.$apply();
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        if (callback) {
          callback.apply(socket, arguments);
        }
        $rootScope.$apply();
      })
    }
  };
});
