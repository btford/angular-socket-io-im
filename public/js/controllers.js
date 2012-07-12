'use strict';

/* Controllers */


function AppCtrl($scope, socket) {

  socket.on('set:name', function (data) {
    $scope.name = data.name;
    $scope.users = data.users;
    $scope.messages = data.messages;
    $scope.$apply();
  });

  socket.on('send:message', function (message) {
    $scope.messages.push(message);
    $scope.$apply();
  });

  var changeName = function (oldName, newName) {

    // retroactively rename that user's messages
    $scope.messages.forEach(function (message) {
      if (message.user === oldName) {
        message.user = newName;
      }
    });

    // rename user in list of users
    var i;
    for (i = 0; i < $scope.users.length; i++) {
      if ($scope.users[i] === oldName) {
        $scope.users[i] = newName;
      }
    }

    $scope.messages.push({
      user: 'chatroom',
      text: 'User ' + oldName + ' is now known as ' + newName + '.'
    });
  }

  socket.on('change:name', function (data) {
    changeName(data.oldName, data.newName);
    $scope.$apply();
  });

  socket.on('user:join', function (data) {
    $scope.messages.push({
      user: 'chatroom',
      text: 'User ' + data.name + ' has joined.'
    });
    $scope.users.push(data.name);
    $scope.$apply();
  });

  // add a message to the conversation when a user disconnects or leaves the room
  socket.on('user:left', function (data) {
    $scope.messages.push({
      user: 'chatroom',
      text: 'User ' + data.name + ' has left.'
    });
    var i, user;
    for (i = 0; i < $scope.users.length; i++) {
      user = $scope.users[i];
      if (user === data.name) {
        $scope.users.splice(i, 1);
        break;
      }
    }

    $scope.$apply();
  });

  $scope.changeName = function () {
    socket.emit('change:name', {
      name: $scope.newName
    }, function (result) {
      if (!result) {
        alert('There was an error changing your name');
      } else {
        
        changeName($scope.name, $scope.newName);

        $scope.name = $scope.newName;
        $scope.newName = '';

        $scope.$apply();
      }
    });
  };

  $scope.sendMessage = function () {
    socket.emit('send:message', {
      message: $scope.message
    });

    // add the message to our model locally
    $scope.messages.push({
      user: $scope.name,
      text: $scope.message
    });

    // clear message box
    $scope.message = '';
  };
}
