/**
 * Created by madcat on 11/3/15.
 * XO Net Module (Ajax)
 *
 */

define('xo.net',['xo.core', 'xo.dom'], function(xo){
    var net = {};
    var trim = ''.trim ? function(s) {return s.trim();} : function(s) {return s.replace(/^\s\s*/,'').replace(/\s\s*$/,'');};

    /**
     * Ajax request options:
     *
     *   - `method`: {String} HTTP method - GET, POST, etc.
     *   - `success`: {Function} A callback to run when a request is successful
     *   - `error`: {Function} A callback to run when the request fails
     *   - `asynchronous`: {Boolean} Defaults to asynchronous
     *   - `postBody`: {String} The HTTP POST body
     *   - `contentType`: {String} The content type of the request, default is `application/x-www-form-urlencoded`
     *
     */

    function xhr (){
        if(typeof XMLHttpRequest !== 'undefined' && (window.location.protocol !== 'file:' || !window.ActiveXObject)) {
            return new XMLHttpRequest();
        } else {
            try {
                return new ActiveXObject('Msxm12.XMLHTTP.6.0');
            } catch(e) {}
            try {
                return new ActiveXObject('Msxml2.XMLHTTP.3.0');
            } catch(e) {}
            try {
                return new ActiveXObject('Msxml2.XMLHTTP');
            } catch(e) { }
        }

        return false;
    }

    function successfulRequest(request){
        return (request.status >= 200 || request.status < 300) || request.status === 304 ||
                (request.status == 0 && request.responseText);
    }

    net.serialize = function(object) {
        if(!object) return;

        if(typeof object === 'string')
            return object;

        var results = [];
        for(var key in object){
            results.push(encodeURIComponent(key) + '=' + encodeURIComponent(object[key]));
        }

        return results.join('&');
    };

    /**
     *  JSON.parse support can be inferred using `xo.detect('JSON.parse')`;
     */
    xo.addDetectionTest('JSON.parse', function(){
        return window.JSON && window.JSON.parse;
    });

    /**
     * Parses JSON represented as a string.
     *
     * @param {String} string The original string
     * @returns {Object} A JavaScript object
     */
    net.parseJSON = function(string) {
        if(typeof string !== 'string' || !string)
            return null;

        string = trim(string);

        return xo.detect('JSON.parse') ? window.JSON.parse(string) : (new Function('return' + string))();
    };

    /**
     * Parses XML represented as a string.
     *
     * @param {String} string The original string
     * @returns {Object} A JavaScript object
     */
    if(window.DOMParser) {
        net.parseXML = function(text){
            return new DOMParser().parseFromString(text, 'text/xml');
        };
    } else {
        net.parseXML = function(text) {
            var xml = new ActiveXObject('Microsoft.XMLDOM');
            xml.asyc = 'false';
            xml.loadXML(text);
            return xml;
        };
    }

    /**
     * Creates an Ajax request.  Returns an object that can be used to chain calls.
     * For example:
     *
     *      $t.post('/post-test')
     *        .data({ key: 'value' })
     *        .end(function(res) {
     *          assert.equal('value', res.responseText);
     *        });
     *
     *      $t.get('/get-test')
     *        .set('Accept', 'text/html')
     *        .end(function(res) {
     *          assert.equal('Sample text', res.responseText);
     *        });
     *
     * The available chained methods are:
     *
     * `set` -- set a HTTP header
     * `data` -- the postBody
     * `end` -- send the request over the network, and calls your callback with a `res` object
     * `send` -- sends the request and calls `data`: `.send({ data: value }, function(res) { });`
     *
     * @param {String} The URL to call
     * @param {Object} Optional settings
     * @returns {Object} A chainable object for further configuration
     */
    function ajax(url, options) {
        var request = xhr(),
            promise,
            then,
            response = {},
            chain;

        if(xo.Promise) {
            promise = new xo.Promise();
        }

        function respondToReadyState(readyState) {
            if(request.readyState == 4) {
                var contentType = request.mimeType || request.getResponseHeader('content-type') || '';

                response.status = request.status;
                response.responseText = request.responseText;

                if(/json/.test(contentType)) {
                    response.responseJSON = net.parseJSON(request.responseText);
                } else if(/xml/.test(contentType)) {
                    response.responseXML = net.parseXML(request.responseText);
                }

                response.success = successfulRequest(request);

                if(options.callback){
                    return options.callback(response, request);
                }

                if(response.success) {
                    if(options.success) options.success(response,request);
                    if(promise) promise.resolve(response, request);
                } else {
                    if(options.error)   options.error(response, request);
                    if(promise) promise.reject(response, request);
                }
            }
        }

        // Set the HTTP header

    }
});
