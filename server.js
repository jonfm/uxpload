var formidable = require("formidable");

var server = http.createServer(function(req, res) {
    console.log("starting server");
    upload_file(req, res);
    switch (url.parse(req.url).pathname) {
        case '/':
            display_form(req, res);
            break;
        case '/upload':
            upload_file(req, res);
            break;
        default:
            show_404(req, res);
            break;
    }
});

var port = 3000; //TODO: make this configurable
server.listen(port);

function display_form (req, res) {
    res.writeHead(200, {'content-type': 'text/html'});
    res.write('<html>TODO: serve form template</html>');
    res.end();
}

// Basic version, logging % uploaded
function upload_file (req, res) {
    console.log( "receiving upload" );
    console.log( req.headers );

    var form = new formidable.IncomingForm();
    form.encoding = "binary";
    form.uploadDir = "/Users/jonathan/tmp";
    form.keepExtensions = true;
    form.maxFieldsSize = 32 * 1024 * 1024;

    form.on('progress', function (bytesReceived, bytesExpected) {
        var percent = 100 * ( bytesReceived / bytesExpected );
        console.log( percent + "% ( " + bytesReceived + " / " + bytesExpected + " )" );
    });

    form.on( "end", function () {
        console.log("request received");
    } );

    form.parse(req, function(err, fields, files) {
        res.writeHead(200, {'content-type': 'text/plain'});
        res.write('received upload:\n\n');
        res.end(util.inspect({fields: fields, files: files}));
    });

}
