/** Shamelessly lifted from the examples at http://jquery.malsup.com/form/progress.html
    for the purpose of getting a working example up and running.
**/

$(document).ready(
    function() {
        var bar = $('.bar');
        var percent = $('.percent');
        var status = $('#status');

        var uploadForm = $("form.upload");

        //make our upload form an ajaxForm
        uploadForm.ajaxForm({
            beforeSend: function() {
                //TODO: grab the url we need for the file and put it in the action
                status.empty();
                var percentVal = 'Uploading...';
                // TODO: make somekind of holding bar so IE7 does not look awful
                bar.width(percentVal)
                percent.html(percentVal);
            },
            uploadProgress: function(event, position, total, percentComplete) {
                var percentVal = percentComplete + '%';
                bar.width(percentVal)
                percent.html(percentVal);
            },
            complete: function(xhr) {
                status.html(xhr.responseText);
            }
        });

        //trigger the form submit when a user selects a file
        uploadForm.children("input[type=file]").change( function () {
            uploadForm.submit();
        } );

    }
);
