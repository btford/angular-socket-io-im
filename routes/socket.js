// Keep track of which names are used so that there are no duplicates
var userNames = (function () {
  var names = {};

  var claim = function (name) {
    if (!name || userNames[name]) {
      return false;
    } else {
      userNames[name] = true;
      return true;
    }
  };

  // find the lowest unused "guest" name and claim it
  var getDefault = function () {
    var name,
      nextUserId = 1;

    do {
      name = 'Guest ' + nextUserId;
      nextUserId += 1;
    } while (!claim(name));

    return name;
  };

  // serialize claimed names as an array
  var get = function () {
    var res = [];
    for (user in userNames) {
      res.push(user);
    }

    return res;
  };

  var free = function (name) {
    if (userNames[name]) {
      delete userNames[name];
    }
  };

  return {
    claim: claim,
    free: free,
    get: get,
    getDefault: getDefault
  };
}());


var messages = (function () {
  var messages = [];

  var add = function (user, text) {
    if (messages.length > 10) {
      messages.shift();
    }
    messages.push({
      user: user,
      text: text
    });
  };

  var get = function () {
    return messages;
  };

  return {
    add: add,
    get: get
  };
}());

// export function for listening to the socket
module.exports = function (socket) {
  var name = userNames.getDefault();

  // send the new user their name
  socket.emit('set:name', {
    name: name,
    messages: messages.get(),
    users: userNames.get()
  });

  socket.broadcast.emit('user:join', {
    name: name
  });

  // broadcast a user's message to other users
  socket.on('send:message', function (data) {
    socket.broadcast.emit('send:message', {
      user: name,
      text: data.message
    });
    messages.add(name, data.message);
  });

  // validate a user's name change, and broadcast it on success
  socket.on('change:name', function (data, fn) {
    if (userNames.claim(data.name)) {
      var oldName = name;
      userNames.free(oldName);

      name = data.name;

      // update message list
      
      var i;
      for (i = 0; i < messages.length; i++) {
        if (messages[i].user === oldName) {
          messages[i].user = name;
        }
      }
      
      socket.broadcast.emit('change:name', {
        oldName: oldName,
        newName: name
      });

      fn(true);
    } else {
      fn(false);
    }
  });

  // clean up when a user leaves, and broadcast it to other users
  socket.on('disconnect', function () {
    socket.broadcast.emit('user:left', {
      name: name
    });
    userNames.free(name);
  });
};
