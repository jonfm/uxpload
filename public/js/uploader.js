/**
 * uploader.js
 *
 * This is the main entry point to the uploader clientside. If there is a failure to reach
 * the ID handler, then we inform the user here, otherwise we can initialise our forms with
 * the returned unique ID and continue.
**/

define(
    ["jquery", "/js/forms.js", "/js/console-override.js"],
    function ($, forms, console) {
        $(document).ready(
            function() {

                var options = {
                    "uploadForm" : $("form.upload"),
                    "dataForm"   : $("form.metadata"),
                    "statusMsg"  : $('#statusMsg')
                };

                $.ajax({
                    "url"     : "/newid",
                    "type"    : "GET",
                    "success" : function (id) {
                        console.log("Received id", id);

                        // Append the ID to both form actions
                        options.uploadForm.attr(
                            "action", options.uploadForm.attr("action") + "/" + id );
                        options.dataForm  .attr(
                            "action", options.dataForm  .attr("action") + "/" + id );

                        forms.initForms(options); //Sets up the two forms for the uploader
                    },
                    "error"  : function () {
                        statusMsg.html(
                            "We are sorry, but an error has occured, please refresh or try again later"
                        );
                    }
                });
            }
        );
    }
);
