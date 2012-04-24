/**
 * test.js
 *
 * Some very basic unit tests for the superupload.js logic
 **/
var assert = require("nodeunit");
var redis  = require("redis"     );

exports["uploadDir is exported"] = function (test) {
    var rclient       = redis.createClient();
        rclient.on("error", function (err) { console.log("Error " + err); });

    var initOptions = {
        "maxUploadSize" : 1000,
        "uploadDir"     : __dirname + "/uploads",
        "redisClient"   : rclient
    };

    var superUpload = require("./lib/superupload.js").init(initOptions);

    test.expect(1);
    test.equal( superUpload.uploadDir, initOptions.uploadDir );
    test.done();
    console.log("done called");

    rclient.quit();
};



//process.on('exit', function(code) { console.log("exited with: " + code ) });
