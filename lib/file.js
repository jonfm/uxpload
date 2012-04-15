/**
 * file.js
 *
 * This module provides handler methods for upload and description. It also 
 * exports an init() function which must be used before using the handlers.
 **/

/**
 * Module dependencies.
 **/

var formidable = require("formidable");
var fs         = require("fs"        );
var uuid       = require('node-uuid' );
var redis      = require("redis"     );

/**
 * Redis client setup
 **/

var rclient       = redis.createClient();
    rclient.on("error", function (err) { console.log("Error " + err); });

/**
 * config vars
 **/

var maxUploadSize;
var uploadDir;

/**
 * init
 *
 * Must be called before using the handlers to prepare for uploading and data
 * storage.
 **/

exports.init = function (options) {
    maxUploadSize = options.maxUploadSize;
    uploadDir     = _initUploadDir( options.uploadDir );

    exports.uploadDir = uploadDir;
};

/**
 * description( request, response )
 * maps the nodejs request params into a datastructure we then store in redis
 **/

exports.description = function (req, res) {
    console.log( req.url );
    console.log( req.params );

    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        console.log( fields );

        var fileId   = fields.fileId;
        var fileData = fields.fileData;
        var fileDesc = fields.fileDesc;
        console.log( fileData );

        if ( fileId && fileData && fileDesc ) {
            // TODO: sanitise and validate filePath and description
            var data     = JSON.parse(fileData);
            data.desc = fileDesc;
            console.log( data );
            console.log( data.url );
            console.log("fileDesc: " + fileDesc);
            console.log("Storing file data: " + data);
            rclient.hmset( fileId, data ); //TODO: add error callback

            res.writeHead(200, {'content-type': 'text/json'});
            res.write( JSON.stringify(data) );
        } else { // log an error, return 400 for a bad request
            console.log(
                "Bad request to save_description\n",
                "error - no fileId or fileDesc or fileData specified\n",
                "fileId:   " + fileId   + "\n",
                "fileData: " + fileData + "\n",
                "fileDesc: " + fileDesc + "\n"
            );
            res.writeHead(400, {'content-type': 'text/plain'});
            res.write( "error - no fileId or fileDesc or fileData specified" );
        }
        res.end();
    });
};

/**
 * upload( request, response )
 **/

exports.upload = function (req, res) {
    console.log( "receiving upload" );
    console.log( req.url );
    console.log( req.headers );

    var form            = new formidable.IncomingForm();
    form.encoding       = "binary";
    form.uploadDir      = uploadDir;
    form.keepExtensions = true;
    form.maxFieldsSize  = maxUploadSize;

    // Log % uploaded
    form.on('progress', function (bytesReceived, bytesExpected) {
        var percent = Math.ceil( 100 * ( bytesReceived / bytesExpected ) );
        console.log( percent + "% ( " + bytesReceived + " / " + bytesExpected + " )" );
    });

    var file = {}; // Closure for the file data
    form.on('file', function(field, uFile) {
        // NB: we only support a single file right now
        file.id    = uuid.v1();
        // TODO: refactor this sanitisation into a util
        // TODO: really need to test this
        file.title = uFile.name;
        file.path  = uFile.name;
        file.path  = file.path.replace(/[\/]/g, "_");
        file.path  = file.path.toLowerCase().split(/\s+/).join("-");
        // We need a unique url, but it would be better to generate a nicer
        // permalink... For now this is out of scope
        file.path  = "/" + file.id + "_" + file.path;
        file.url   = "/files" + file.path;

        fs.rename( uFile.path, form.uploadDir + file.path );
    })

    form.parse(req, function(err, fields, files) {
        if (err) {
            res.writeHead( 400, {'content-type': 'text/plain'} );
            res.write( "An error occurred parsing the upload" );
            console.err(err);
        } else if (file.id) {
            res.writeHead( 200, {'content-type': 'application/json'} );
            res.write( JSON.stringify(file) );
        } else {
            res.writeHead( 400, {'content-type': 'application/json'} );
            res.write( JSON.stringify(req) );
        }
    });

    form.on( "end", function () {
        //TODO: consider checking filetype and maybe discarding
        //TODO: consider returning an md5 checksum
        console.log( "request received" );
        res.end('\n');
    } );

};


_initUploadDir = function (uploadDir) {
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
