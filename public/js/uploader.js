/** Shamelessly lifted from the examples at http://jquery.malsup.com/form/progress.html
    for the purpose of getting a working example up and running.

    A few extra bits added to mould the behaviour into the spec, including the parts handling the meta
    data (form.metadata).
**/

$(document).ready(
    function() {
        var bar        = $('.bar');
        var percent    = $('.percent');
        var status     = $('#status');
        var uploadForm = $("form.upload");
        var dataForm   = $("form.metadata");

        var uploadInProgress = 0;

        //make our upload form an ajaxForm
        uploadForm.ajaxForm({
            beforeSend: function () {
                dataForm.trigger("uploadStart");
                status.empty();
                var percentVal = 'Uploading...';
                // TODO: make somekind of holding bar so IE7 does not look awful
                bar.width(percentVal)
                percent.html(percentVal);
            },
            uploadProgress: function (event, position, total, percentComplete) {
                var percentVal = percentComplete + '%';
                bar.width(percentVal)
                percent.html(percentVal);
            },
            complete: function (xhr) {
                dataForm.trigger("uploadComplete", [xhr]);
                status.html(xhr.responseText);
            },
            error: function () {
                status.html("There seems to have been a problem with the upload, please contact support...");
                // TODO: post back error report
            }
        });

        //trigger the form submit when a user selects a file
        uploadForm.children("input[type=file]").change( function () {
            uploadForm.submit();
        } );

        // Here we want to initialise some event relating to dataForm around closures
        // TODO: consider refactoring this out into its own module, making the closures internal properties
        ( function () {
            // WHEN the description is saved
            // UNLESS the file is uploading
            // PROMPT the user to choose a file
            // WHEN the description is saved
            // AND the file is uploaded
            // SUBMIT the description form
            descriptionSaved = false;
            fileUploaded     = false;
            fileUploading    = false;
            saveButton       = dataForm.children("input[type=submit]");

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
            });
            dataForm.bind("uploadComplete", function () {
                fileUploaded  = true;
                fileUploading = false;
                if ( descriptionSaved ) postDescription();
            });
            // IF the user edits the description again, don't send it to the server until they save again
            dataForm.children(".description").bind( "keyup", function () {
                window.console.log("description edited");
                saveButton.attr( "disabled", false );
                descriptionSaved = false;
            })
            function postDescription () {
                window.console.log("sending description to server...");
            }
        } )();

    }
);
