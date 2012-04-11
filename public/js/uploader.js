/** Shamelessly lifted from the examples at http://jquery.malsup.com/form/progress.html
    for the purpose of getting a working example up and running.
**/

(function() {
    var bar = $('.bar');
    var percent = $('.percent');
    var status = $('#status');

    $('form.upload').ajaxForm({
        iframe: true,
        beforeSend: function() {
            window.console.log("sending..."); //TODO: remove or define console
            status.empty();
            var percentVal = '0%';
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

})();

(function () {
    $(document).ready( function () {
        uploadForm = $("form.upload");
        uploadForm.children("input[type=file]").change( function () {
            uploadForm.submit();
        } );
    });
})();
