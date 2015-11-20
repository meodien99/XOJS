/**
 * Created by madcat on 11/19/15.
 */
/**
 * Contains everything relating to the `require` module.
 */
define('xo.require',['xo.core'], function(xo){
    var appendTo = document.head || document.getElementsByTagName('head'),
        scriptOptions = ['async', 'defer', 'src', 'text'];

    /**
     * Used to determine if a script is from the same origin.
     *
     * @param {String} Path to a script
     * @return {Boolean} True when `src` is from the same origin
     */
    function isSameOrigin(src){
        return src.charAt(0) === '/' || src.indexOf(location.protocol + '//' + location.host) !== -1 || false;
    }

    /**
     * Creates a script tag from a set of options.
     *
     * Options may include: `async`, `defer`, `src`, and `text`.
     *
     * @param {Object} The options
     * @return {Object} The script tag's DOM object
     */
    function createScript(options){
        var script = document.createElement('script'), key;

        for(key in scriptOptions){
            key = scriptOptions[key];

            if(options[key]){
                script[key] = options[key];
            }
        }

        return script;
    }

    /**
     * Inserts a script tag into the document.
     *
     * @param {String} The script tag
     */
    function insertScript(script) {
        appendTo.insertBefore(script, appendTo.firstChild);
    }
});