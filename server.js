var http       = require("http");
var formidable = require("formidable");
var express    = require("express");
var connect    = require("connect");
var fs         = require("fs");

// Config variables
var port = process.env.PORT || 3000;
var uploadDir = process.env.UPLOAD_DIR || __dirname + "/uploads";

//TODO: looks horrible, refactor
fs.stat( uploadDir, function (err, stats) {
    if (err) {
        fs.mkdir( uploadDir, "0777", function (mkdir_err) {
            if (mkdir_err) {
                console.error( "Cannot create upload directory " + uploadDir + " Error: " + mkdir_err );
                throw mkdir_err;
            } else {
                console.log("Created upload dir: " + uploadDir);
            }
        } );
    }
} );

//TODO: bail out if the upload directory is not writable or does not exist

var app = express.createServer();
app.use( connect.logger() );

// Static paths to handle
app.use( "/", express.static(__dirname + '/public/html') );
app.use( "/css", express.static(__dirname + '/public/css') );
app.use( "/js", express.static(__dirname + '/public/js') );
app.use( "/files", express.static(uploadDir) );

// Dispatch section
app.post("/upload", upload_file);

// Start App
app.listen(port);


/**
    upload_file expects request and response objects like any nodejs handler
**/

// Basic version, logging % uploaded
function upload_file (req, res) {
    console.log( "receiving upload" );
    console.log( req.url );
    console.log( req.headers );
    //console.log( req.query );

    var form = new formidable.IncomingForm();
    form.encoding = "binary";
    form.uploadDir = uploadDir;
    form.keepExtensions = true;
    form.maxFieldsSize = 32 * 1024 * 1024; //TODO: define this in config

    form.on('progress', function (bytesReceived, bytesExpected) {
        var percent = Math.ceil( 100 * ( bytesReceived / bytesExpected ) );
        console.log( percent + "% ( " + bytesReceived + " / " + bytesExpected + " )" );
    });

    form.on( "end", function () {
        //TODO: consider checking filetype and maybe discarding
        //TODO: consider returning an md5 checksum
        console.log( "request received" );
    } );

    form.parse(req, function(err, fields, files) {
        // TODO: on a parse error return 400
        res.writeHead(200, {'content-type': 'text/plain'});
        if (req.headers["X-Requested-With"] === undefined) {
            res.write('<textarea>received upload:\n\n</textarea>');
        } else {
            res.write('received upload:\n\n');
        }
        res.end();
    });

}
