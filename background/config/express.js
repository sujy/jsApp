var express = require('express');
var glob = require('glob');

var redis = require("redis");
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compress = require('compression');
var methodOverride = require('method-override');
var multer = require('multer');
var fs = require('fs');
var session = require('express-session');
var redisStore = require('connect-redis')(session);
var client = redis.createClient(6379, 'localhost');

//use for session
var session = require('express-session');
var redisStore = require('connect-redis')(session);
var redis = require('redis');
var client = redis.createClient(6379, 'localhost');


module.exports = function(app, config) {
  app.set('views', config.root + '/app/views');
  app.set('view engine', 'jade');

  //use for session
  app.use(session({
      store : new redisStore({
          client : client,
          host : 'localhost',
          port : 6379,
      }),
      resave : false, //don't save session if unmodified
      saveUninitialized : false, //don't create session until something stored
      secret : 'andaifuonline'
  }));

  // app.use(favicon(config.root + '/public/img/favicon.ico'));
  app.use(logger('dev'));
  app.use(bodyParser.json({
    limit: '10mb'
  }));
  app.use(bodyParser.urlencoded({
    extended: true,
    limit: '10mb'
  }));
  //multer handle file
  app.use(multer({ 
    dest: './uploads/',
    limits: {
      fieldNameSize : 100,
      fileSize : 5242880
    },
    onFileSizeLimit: function (file) {
      console.log('Failed: ', file.originalname);
      fs.unlink('./' + file.path);
       // delete the partially written file
    },
    rename: function (fieldname, filename) {
      return fieldname + "-" + filename + "-" + Date.now();
    },
    onFileUploadStart: function (file) {
      console.log(file.originalname + ' is starting upload...')
    },
    onFileUploadComplete: function (file) {
      console.log(file.fieldname + ' uploaded to  ' + file.path)
      isDone = true;
    }
  }));
  //session
  app.use(session({
      store: new redisStore({ host: 'localhost', port: 6379, client: client }),
      resave : false,
      saveUninitialized : false,
    secret: 'keyboard cat'
  }));
  
  app.use(cookieParser());
  app.use(compress());
  app.use(express.static(config.root + '/public'));
  app.use(methodOverride());

  var controllers = glob.sync(config.root + '/app/controllers/*.js');
  controllers.forEach(function (controller) {
    require(controller)(app);
  });

  app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });
  
  if(app.get('env') === 'development'){
    app.use(function (err, req, res, next) {
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: err,
        title: 'error'
      });
    });
  }

  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: {},
        title: 'error'
      });
  });

};
