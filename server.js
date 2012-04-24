/**
 * SuperUpload
 *
 * This is a node.js application to handle file uploads, assigning them a uuid.v1-generated
 * unique ID, storing them in a redis data store and reporting upload status to the client.
 * The uploads are stored in a directory specified in the options hash given to superupload's
 * init function.
 *
 * server.js serves 3 purposes:
 *
 * 1) Defines static routes to serve HTML, css, and JS resources.
 * 2) Configures an express node app with parameters dependent on the invoking
 *    environment.
 * 3) Sets up routes to handle uuid provisioning, file upload and metadata via GET/POST to
 *    three separate locations. The actual methods are handled in the "superupload" module.
 **/

/**
 * Module dependencies.
 **/

var express = require("express");
var connect = require("connect");
var redis   = require("redis"     );

/**
 * Redis client setup
 **/

var redisClient = redis.createClient();
    redisClient.on("error", function (err) { console.log("Error " + err); });

/**
 * superupload is the module we want to handle our requests.
 **/

var superUpload = require("./lib/superupload.js").init({
    "maxUploadSize" : process.env.MAX_UPLOAD_SIZE || 32 * 1024 * 1024,
    "uploadDir"     : process.env.UPLOAD_DIR      || __dirname + "/uploads",
    "redisClient"   : redisClient
});

/**
 * Configuration and initialisation
 **/

var port = process.env.PORT || 3000; //default for development
var app  = express.createServer();
    app.use( connect.logger() );

/**
 * Static path routes
 **/

app.use( "/",          express.static(__dirname + '/public/html')             );
app.use( "/css",       express.static(__dirname + '/public/css')              );
app.use( "/js",        express.static(__dirname + '/public/js')               );
app.use( "/files",     express.static(superUpload.uploadDir)                         );

/**
 * Dynamic path routes
 **/

app.post( "/upload/:id",      superUpload.upload      );
app.post( "/description/:id", superUpload.description );
app.get ( "/newid",           superUpload.fileId      );

/**
 * Start the app listening on the configured port.
 **/

app.listen(port);
