define(
    [],
    function ($, forms) {
        var console = window.console;
        if ( typeof console == "undefined"
          || typeof console.log == "undefined" ) {
              console = { log: function() {} };
        }
        window.console = console;
        return console;
    }
);
