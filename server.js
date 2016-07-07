/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var express = require('express');
var app = express();
var session = require('express-session');
var bodyParser = require('body-parser');
var expressJwt = require('express-jwt');
var mongoose = require('mongoose');
var compression = require('compression');
var fs = require('fs');
var config = {};

try {
  stats = fs.statSync("config.json");
  config = require('./config.json');
  console.log("Using config.json");
}
catch (e) {
  config = require('./config.sample.json');
  console.log("Using config.sample.json");
}

mongoose.connect(config.dbURL);
require("./model/user.js");
require("./model/post.js");
require("./model/settings.js");
var env = process.env.NODE_ENV;
console.log(env);
app.enable('trust proxy');
app.use(compression());
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

if(env === 'production'){
  app.set('view cache', true);
  app.use(function(req, res, next){
    if ( req.headers['x-forwarded-proto'] === 'http' ) {
        var tmp = 'https://' + req.headers.host + req.originalUrl;
        res.redirect(tmp);
    } else {
        return next();
    }
  })
}



// make '/app' default route
app.use('/', express.static('app'));
app.all(/^((?!\/api).)*$/, function(req, res, next) {
    // Just send the index.html for other files to support HTML5Mode
    console.log(req.originalUrl);
    res.sendFile('index.html', { root: __dirname + '/app' });
});

app.use('/js', express.static(__dirname + '/app/js'));
app.use('/css', express.static(__dirname + '/app/css'));


app.use('/api', expressJwt({secret: config.secret}).unless(function(req) {
  console.log(req.originalUrl + "  "+ req.method);
  return (
    //req.originalUrl === '/api/test/' ||
    req.originalUrl === '/api/authenticate' ||
    req.originalUrl === '/api/register' ||
    req.originalUrl === '/api/settings' && req.method === 'GET' ||
    /^\/api\/post\/public\/*.*/.test(req.originalUrl) && req.method === 'GET' ||
    /^\/api\/profile\/public\/*.*/.test(req.originalUrl) && req.method === 'GET'
  );
}));//.unless({ path: ['/api/authenticate', '/api/register', '/api'] }));

app.use(function (err, req, res, next) {
      if (err.name === 'UnauthorizedError') {
        if (!req.headers.authorization)
          res.status(401).send('missing authorization header');

        res.status(401).send('Invalid authorization token');
      }
    });
app.use('/api', require("./controller/auth.controller.js"));

// start server
var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
var server = app.listen(server_port, server_ip_address, function () {
    console.log('Server listening at http://' + server.address().address + ':' + server.address().port);
});
