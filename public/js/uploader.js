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
            //iframe: true,

            beforeSend: function() {
                window.console.log("sending..."); //TODO: remove or define console
                status.empty();
                var percentVal = '0%';
                bar.width(percentVal)
                percent.html(percentVal);
            },
            uploadProgress: function(event, position, total, percentComplete) {
                window.console.log("upload progress..."); //TODO: remove or define console
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
