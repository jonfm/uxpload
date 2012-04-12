var http       = require("http");
var formidable = require("formidable");
var express    = require("express");
var connect    = require("connect");
var fs         = require("fs");

// Config variables
var port       = process.env.PORT || 3000;
var uploadDir  = initUploadDir();
var app        = express.createServer();

// Define a better logger
app.use( connect.logger() );

// Static paths to handle
app.use( "/",      express.static(__dirname + '/public/html') );
app.use( "/css",   express.static(__dirname + '/public/css') );
app.use( "/js",    express.static(__dirname + '/public/js') );
app.use( "/files", express.static(uploadDir) );

// Dispatch section
app.post( "/upload", upload_file );

// Start App
app.listen(port);


/**
    upload_file expects request and response objects like any nodejs handler
**/

function upload_file (req, res) {
    console.log( "receiving upload" );
    console.log( req.url );
    console.log( req.headers );

    var form = new formidable.IncomingForm();
    form.encoding = "binary";
    form.uploadDir = uploadDir;
    form.keepExtensions = true;
    form.maxFieldsSize = 32 * 1024 * 1024; //TODO: define this in config

    // Log % uploaded
    form.on('progress', function (bytesReceived, bytesExpected) {
        var percent = Math.ceil( 100 * ( bytesReceived / bytesExpected ) );
        console.log( percent + "% ( " + bytesReceived + " / " + bytesExpected + " )" );
    });

    var filename; // Closure for the name of the file
    form.on('file', function(field, file) { // TODO: what is in field here?
        // NB: we only support a single file right now
        filename = file.name;
        //rename the incoming file to the file's name
        // TODO: what about nasty characters?
        // TODO: what about "../../../bin"?
        fs.rename( file.path, form.uploadDir + "/" + file.name );
    })

    form.parse(req, function(err, fields, files) {
        if (err) {
            res.writeHead( 400, {'content-type': 'text/plain'} );
            res.write( "An error occurred parsing the upload" );
            console.err(err);
        } else {
            res.writeHead(200, {'content-type': 'text/plain'});
            //TODO: consider putting the HTML part into the client
            //TODO: sort out the magic filepath here
            var linkToFile = "<a href='/files/" + filename + "'>Uploaded to /files/" + filename + "</a>";
            res.write( linkToFile );
        }
    });

    form.on( "end", function () {
        //TODO: consider checking filetype and maybe discarding
        //TODO: consider returning an md5 checksum
        console.log( "request received" );
        res.end();
    } );

}

//TODO: looks horrible, refactor
function initUploadDir () {
    var uploadDir = process.env.UPLOAD_DIR || __dirname + "/uploads";
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
    return uploadDir;
}
