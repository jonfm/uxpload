var http = require("http");
var url = require("url");
var formidable = require("formidable");

// Config variables
var port = 3000; //TODO: make this configurable
var uploadDir = __dirname + "/uploads"; // TODO: get this from config
//TODO: bail out if the upload directory is not writable or does not exist

var server = http.createServer(function (req, res) {
    console.log("starting server");
    switch (url.parse(req.url).pathname) {
        case '/':
            display_form(req, res);
            break;
        case '/upload':
            upload_file(req, res);
            break;
        default:
            //show_404(req, res);
            break;
    }
});
server.listen(port);

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
        res.end(util.inspect({fields: fields, files: files}));
    });

}
