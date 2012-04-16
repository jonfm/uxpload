define(
    ["jquery", "/js/jquery.form.js", "/js/console-override.js"], //jquery form adds the ajaxForm function
    function ($, jqforms, console) {
        var exports = {};
        exports.initForms =  function (options) {

            var bar        = $('.bar');
            var percent    = $('.percent');
            var statusMsg  = options.statusMsg;
            var uploadForm = options.uploadForm;
            var dataForm   = options.dataForm;

            //make our upload form an ajaxForm
            uploadForm.ajaxForm({
                //dataType: 'json',
                beforeSend: function () {
                    dataForm.trigger("uploadStart");
                    statusMsg.empty();
                    var percentVal = '';
                    bar.width(percentVal)
                    percent.html(percentVal);
                    dataForm.trigger("uploadStart");
                },
                uploadProgress: function (event, position, total, percentComplete) {
                    var percentVal = percentComplete + '%';
                    bar.width(percentVal)
                    percent.html(percentVal);
                },
                success: function (res, statusText, xhr, form) {
                    dataForm.trigger("uploadComplete", [res]);
                    console.log(res);
                    statusMsg.html( res );
                },
                error: function () {
                    statusMsg.html("There seems to have been a problem with the upload, please contact support...");
                    // In the future we can send back an error report.
                }
            });

            //trigger the form submit when a user selects a file
            uploadForm.children("input[type=file]").change( function () {
                uploadForm.submit();
            } );

            // WHEN the description is saved
            // UNLESS the file is uploading
            // PROMPT the user to choose a file
            // WHEN the description is saved
            // AND the file is uploaded
            // SUBMIT the description form
            var descriptionSaved = false;
            var fileUploaded     = false;
            var fileUploading    = false;
            var saveButton       = dataForm.children("input[type=submit]");

            dataForm.bind( "submit", function (e) {
                descriptionSaved = true;
                saveButton.attr( "disabled", "disabled");
                e.preventDefault();
                if ( fileUploaded ) {
                    postDescription();
                } else if ( fileUploading ) {
                    // when the upload completes, the description will be posted
                } else {
                    alert( "Please choose a file to upload with your description." );
                }
            });
            dataForm.bind("uploadStart", function () {
                fileUploaded  = false;
                fileUploading = true;
                if ( descriptionSaved ) postDescription();
            });
            dataForm.bind("uploadComplete", function (e, data) {
                fileUploaded  = true;
                fileUploading = false;

                console.log(data.id);

                if ( descriptionSaved ) postDescription();
            });
            // IF the user edits the description again, don't send it to the server until they save again
            dataForm.children(".description").bind( "keyup", function () {
                saveButton.attr( "disabled", false );
                descriptionSaved = false;
            })
            function postDescription () {
                console.log("sending description to server...");
                $.post(
                    dataForm.attr("action"),
                    dataForm.serialize(),
                    function (data) {
                        console.log(data);
                        $("#savedTitle").html( data.title );
                        $("#savedPath") .html( data.path  );
                    }
                );
            }

        }
        return exports;
    }
);
