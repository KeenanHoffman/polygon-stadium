'use strict';

require('dotenv').load({
  silent: true
});

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const expressJwt = require('express-jwt');

const routes = require('./routes');

const app = express();

app.use(cors());
app.use(function(req, res, next) {
  req.models = app.models;
  next();
});
app.use('/users', expressJwt({
  secret: process.env.SECRET
}).unless({path: ['/users/new']}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json(err.message);
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json(err.message);
});


module.exports = app;
