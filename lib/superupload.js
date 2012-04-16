/**
 * superupload.js
 *
 * This module provides handler methods for upload and description. It exports an init()
 * function which returns a pseudo object with properties referencing the handlers.
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
 * init()
 *
 * Must be called before using the handlers to prepare for uploading and data
 * storage. Returns a psuedo-object (hash) with properties for each method.
 **/

exports.init = function (options) {

    uploadDir     = _initUploadDir( options.uploadDir ); // will throw an error if dir is not writable
    maxUploadSize = options.maxUploadSize;

    var exports = { "uploadDir": uploadDir };

    /**
     * fileId( request, response )
     *
     * Generate a unique Id for the file.
     **/

    exports.fileId = function (req, res) {
        fileId = uuid.v1();
        res.writeHead( 200, {'content-type': 'application/json'} );
        res.write( JSON.stringify(fileId) );
        res.end();
    }

    /**
     * description( request, response )
     * maps the nodejs request params into a datastructure we then store in redis
     **/

    exports.description = function (req, res) {
        var fileId = req.params.id;
        console.log( "Received description for file: ", fileId );

        var form = new formidable.IncomingForm();
        form.parse(req, function(err, fields, files) {
            console.log( "Fields in POST: ", fields );

            var fileDesc = fields.fileDesc;

            if ( fileId && fileDesc ) {

                rclient.hset( fileId, "desc", fileDesc, function (err) {
                    if (err) { console.log(err) };
                });

                rclient.hgetall( fileId, function (err, data) {
                    console.log(data);
                    res.writeHead(200, {'content-type': 'application/json'});
                    res.write( JSON.stringify(data) );
                    res.end();
                });

            } else { // log an error, return 400 for a bad request
                console.log(
                    "Bad request to save_description\n",
                    "error - no fileId or fileData specified\n",
                    "URL: +    " + req.url  + "\n",
                    "fileId:   " + fileId   + "\n",
                    "fileDesc: " + fileDesc + "\n"
                );
                res.writeHead(400, {'content-type': 'text/plain'});
                res.write( "error - no fileId or fileDesc or fileData specified" );
                res.end();
            }
        });
    };

    /**
     * upload( request, response )
     *
     * Handles a multipart POST request using formidable to parse the stream and write to disc in chunks.
     **/

    exports.upload = function (req, res) {
        var fileId = req.params.id;

        console.log( "Receiving upload for file: ", fileId );

        var form            = new formidable.IncomingForm();
        form.encoding       = "binary";
        form.uploadDir      = uploadDir;
        form.keepExtensions = true;
        form.maxFieldsSize  = maxUploadSize;

        var file = {}; // Closure for the file data NB: we only support a single file right now
        form.on('file', function(field, uFile) {

            file = _fileData(uFile, fileId);

            rclient.hmset( fileId, file, function (err) {
                if (err) { console.log(err) };
            });

            fs.rename( uFile.path, form.uploadDir + file.path );

        })

        form.parse(req, function(err, fields, files) {
            if (err) {
                res.writeHead( 400, {'content-type': 'text/plain'} );
                res.write( "An error occurred parsing the upload" );
                console.err(err);
            } else if (file.id) {
                res.writeHead( 200, {'content-type': 'text/plain'} );
                res.write( file.path );
            } else {
                res.writeHead( 400, {'content-type': 'application/json'} );
                res.write( "No fileId" );
            }
            res.end();
        });

    };

    /**
     * _fileData(uploadedFile, fileId)
     *
     * Tiny utility method to combine the uploaded file and a file id into a Hash and generate
     * a useful path. Could be made part of a constructor for the file object, should it get more
     * complex.
     **/

    function _fileData (uFile, fileId) {
        var file = {};
        file.id    = fileId;
        file.title = uFile.name;
        file.path  = uFile.name;
        file.path  = file.path.replace(/[\/]/g, "_");
        file.path  = file.path.toLowerCase().split(/\s+/).join("-");
        file.path  = "/" + file.id + "_" + file.path;
        return file;
    }

    /**
     * _initUploadDir( dir )
     *
     * Takes the directory argument as a string and checks that this dir is writable. If the dir
     * does not exist, it will try to create it.
     **/

    function _initUploadDir (uploadDir) {
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

    return exports;
};

