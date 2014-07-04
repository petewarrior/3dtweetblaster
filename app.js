var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();
var server = require('http').Server(app);
var router = express.Router();

var io = require('socket.io')(server);
var Twit = require('twit');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// prepare Twitter stream
  var twit = new Twit({
    consumer_key: 'I2xvqxAPrQFLY2YI3zG4g',
    consumer_secret: 'HlVw1XFTsvcmDwcEPk5u5B9aBN0Dvfu3X3nIBySaqY',
    access_token: '21967366-hLGfSmqHjChj0ZMsBPdI8j2TbBNBisJeDEawTQttd',
    access_token_secret: 'v8sIEHW07OrUK6mHBDLatBxNLr3tx0kgBahXsHV4'
  });

var stream;

router.get('/:keywords', function(req, res) {
  var keywords = req.param('keywords');
  console.log(keywords);
  res.render('index', {
    title: '3D Tweet Blaster'
  });
  
  stream.stop();

  io.on('connection', function (socket) {
    socket.on('send', function (data) {
      console.log(data);
      io.sockets.emit('message', data);
    });
  });

  stream = twit.stream('statuses/filter', {
    track: keywords
  });
  
    stream.on('tweet', function (data) {

        console.log(data);
        
        //io.sockets.emit('message', data);

        //var parsed = JSON.parse(data);

        //for (t in parsed) {
        //   console.log(t.user.screen_name + ": " + t.text);
        // }
      

    });

});

app.use('/', router);

/// catch 404 and forward to error handler
  app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

/// error handlers

// development error handler
// will print stacktrace
  if (1) {//app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
      res.status(err.status || 500);
      res.render('error', {
        message : err.message,
        error : err
      });
    });
  }

// production error handler
// no stacktraces leaked to user
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message : err.message,
      error : {}
    });
  });

  module.exports = app;
