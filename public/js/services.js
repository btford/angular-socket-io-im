'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
app.factory('socket', function () {
  var socket = io.connect();
  return socket;
});
