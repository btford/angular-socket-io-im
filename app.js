
/**
 * Module dependencies.
 */

var express = require('express'),
  routes = require('./routes'),
  socket = require('./routes/socket.js'),
  http   = require('http'),
  path   = require('path');

var app = module.exports = express();

// Hook Socket.io into Express
var io  = require('socket.io');

// Configuration
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);
// development only
if (app.get('env') === 'development') {
  app.use(express.errorHandler());
}

// production only
if (app.get('env') === 'production') {
  app.use(express.errorHandler());
};

// Routes

app.get('/', routes.index);
app.get('/partials/:name', routes.partials);

// redirect all others to the index (HTML5 history)
app.get('*', routes.index);

// Socket.io Communication

// Start server
http = http.createServer(app);
io = io.listen(http);

http.listen(app.get('port'), function () {
	console.log("Express server listening on port %d in %s mode", app.get('port'), app.get('env'));
});

io.sockets.on('connection', socket );
