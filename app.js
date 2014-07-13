var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();
var server = require('http').Server(app);
var router = express.Router();

var io = require('socket.io')(server);
var Twit = require('twit');

/* authInfo content:
 var auth = {
 consumer_key: '',
 consumer_secret: '',
 access_token: '',
 access_token_secret: ''
 };

 module.exports = auth;
 */
var authInfo = require('./authInfo');

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
var twit = new Twit(authInfo);

var wordlist = [];

var stream = null;

io.on('connection', function(socket) {
    //console.log(socket);
    socket.lastTweet = 0;
    socket.emit("welcome", {
        "message" : "Welcome!"
    });

    socket.on("request new tweet", function(data) {
        console.log('last tweet ' + socket.lastTweet);
        if (wordlist.length > socket.lastTweet) {
            socket.emit('new tweet', wordlist[socket.lastTweet]);
            console.log('sent tweet #' + socket.lastTweet + ' to client ' + socket.id);
            socket.lastTweet++;
        } else {
            socket.emit('no tweet yet', {});
        }
    });
});

router.get('/canvas/:keywords', function(req, res) {

    var keywords = req.param('keywords');
    res.render('canvas', {
        title : '3D Tweet Blaster - Canvas',
        //port : process.env.PORT || 3000,
        host : req.headers.host
    });

    if (stream)
        stream.stop();

    stream = twit.stream('statuses/filter', {
        track : keywords
    });

    console.log("start tracking");
    stream.on('tweet', function(data) {

        if (wordlist.length < 1000)
            wordlist[wordlist.length] = data;

        console.log("tweets in buffer: " + wordlist.length
        );
        //io.sockets.emit('new tweet', data);

        //var parsed = JSON.parse(data);

        //for (t in parsed) {
        //   console.log(t.user.screen_name + ": " + t.text);
        // }

    });

});

router.get('/keywords', function(req, res) {

    var keywords = req.param('keywords');
    res.render('index', {
        title : '3D Tweet Blaster'
    });

    if (stream)
        stream.stop();

    stream = twit.stream('statuses/filter', {
        track : keywords
    });

    console.log("start tracking");
    stream.on('tweet', function(data) {

        console.log("tweet received");
        //io.sockets.emit('new tweet', data);
        if (wordlist.length < 1000)
            wordlist[wordlist.length] = data;
        //var parsed = JSON.parse(data);

        //for (t in parsed) {
        //   console.log(t.user.screen_name + ": " + t.text);
        // }

    });

});

router.get('/', function(req, res) {

    res.render('welcome', {
        title : '3D Tweet Blaster'
    });
});


app.use('/', router);

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', "http://" + req.headers.host + ':' + process.env.PORT || 3000);
    res.setHeader('Access-Control-Allow-Origin', "http://" + 'tweet3d.herokuapp.com' + ':' + process.env.PORT || 3000);

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    next();
});

/// catch 404 and forward to error handler
/*app.use(function(req, res, next) {
var err = new Error('Not Found');
err.status = 404;
next(err);
});*/

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
    console.log(err.message);
    res.render('error', {
        message : err.message,
        error : {}
    });
});

module.exports = server;
