var formidable = require("formidable");
var express = require("express");

// Config variables
var port = 3000; //TODO: make this configurable
var uploadDir = __dirname + "/uploads"; // TODO: get this from config
//TODO: bail out if the upload directory is not writable or does not exist

var app = express.createServer();
app.use("/", express.static(__dirname + '/public/html'));
app.post("/upload", upload_file);
app.listen(port);

// For this prototype in development, we serve a static file
function display_form (req, res) {
    res.writeHead(200, {'content-type': 'text/html'});
    res.end('<html>TODO: serve form template</html>');
}

// Basic version, logging % uploaded
function upload_file (req, res) {
    console.log( "receiving upload" );
    console.log( req.headers );

    var form = new formidable.IncomingForm();
    form.encoding = "binary";
    form.uploadDir = uploadDir;
    form.keepExtensions = true;
    form.maxFieldsSize = 32 * 1024 * 1024;

    form.on('progress', function (bytesReceived, bytesExpected) {
        var percent = 100 * ( bytesReceived / bytesExpected );
        console.log( percent + "% ( " + bytesReceived + " / " + bytesExpected + " )" );
    });

    form.on( "end", function () {
        console.log( "request received" );
    } );

    form.parse(req, function(err, fields, files) {
        res.writeHead(200, {'content-type': 'text/plain'});
        res.write('received upload:\n\n');
        res.end();
    });

}
