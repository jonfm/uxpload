/**
 * server.js
 *
 * Serves 3 purposes:
 *
 * 1) Defines static routes to serve HTML, css, and JS resources.
 * 2) Configures an express node app with paramters dependent on the invoking
 *    environment.
 * 3) Sets up routes to handle file upload and metadata via POST to two separate
 *    locations. The actual methods are handled in the "file" module.
 **/

/**
 * Module dependencies.
 **/

var express = require("express"   );
var connect = require("connect"   );

/**
 * This is the module we want to handle our requests.
 **/

var file    = require("./lib/file.js");
file.init({
    "uploadDir": process.env.UPLOAD_DIR || __dirname + "/uploads"
});

/**
 * Configuration and initialisation
 **/

var port          = process.env.PORT            || 3000; //default
var maxUploadSize = process.env.MAX_UPLOAD_SIZE || 32 * 1024 * 1024; //default
var app           = express.createServer();
    app.use( connect.logger() );

/**
 * Static path routes
 **/

app.use( "/",          express.static(__dirname + '/public/html')             );
app.use( "/css",       express.static(__dirname + '/public/css')              );
app.use( "/requirejs", express.static(__dirname + '/node_modules/requirejs/') );
app.use( "/js",        express.static(__dirname + '/public/js')               );
app.use( "/files",     express.static(file.uploadDir)                         );

/**
 * Dynamic path routes
 **/

app.post( "/upload",      file.upload      );
app.post( "/description", file.description );

/**
 * Start the app listening on the configured port.
 **/

app.listen(port);
