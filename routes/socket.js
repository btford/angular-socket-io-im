// Keep track of which names are used so that there are no duplicates
var userNames = {};

var setUserName = function (name) {
  if (!name || userNames[name]) {
    return false;
  } else {
    userNames[name] = true;
    return true;
  }
};

var freeUserName = function (name) {
  if (userNames[name]) {
    delete userNames[name];
  }
};

// find the lowest unused "guest" name and claim it
var newUserName = function () {
  var name,
    nextUserId = 1;

  do {
    name = 'Guest ' + nextUserId;
    nextUserId += 1;
  } while (!setUserName(name));

  return name;
};

var getUsers = function () {
  var res = [];
  for (user in userNames) {
    res.push(user);
  }

  return res;
};

var messages = [];

var addMessage = function (user, text) {
  if (messages.length > 10) {
    messages.shift();
  }
  messages.push({
    user: user,
    text: text
  });
}

// export function for listening to the socket
module.exports = function (socket) {
  var name = newUserName();

  // send the new user their name
  socket.emit('set:name', {
    name: name,
    messages: messages,
    users: getUsers()
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
    addMessage(name, data.message);
  });

  // validate a user's name change, and broadcast it on success
  socket.on('change:name', function (data, fn) {
    if (setUserName(data.name)) {
      var oldName = name;
      freeUserName(oldName);

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
    freeUserName(name);
  });
};
