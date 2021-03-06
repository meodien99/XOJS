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
     *      $xo.post('/post-test')
     *        .data({ key: 'value' })
     *        .end(function(res) {
     *          assert.equal('value', res.responseText);
     *        });
     *
     *      $xo.get('/get-test')
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

        // Set the HTTP headers
        function setHeaders(){
            var defaults = {
                'Accept' : 'text/javascript, application/json, text/html, application/xml, text/xml, */*',
                'Content-Type' : 'application/x-www-form-urlencoded'
            };

            // Merge headers with defaults
            for(var name in defaults) {
                if(!options.headers.hasOwnProperty(name)) {
                    options.headers[name] = defaults[name];
                }
            }

            for(var name in options.headers){
                request.setRequestHeader(name, options.headers[name]);
            }
        }

        if(typeof options === 'undefined') options = {};

        options.method = options.method ? options.method.toLowerCase() : 'get';
        options.asynchronous = options.asynchronous || true;
        options.postBody = options.postBody || '';

        request.onreadystatechange = respondToReadyState;
        request.open(options.method, url, options.asynchronous);

        options.headers = options.headers || {};

        if(options.contentType){
            options.headers['Content-Type'] = options.contentType;
        }

        if(typeof  options.postBody !== 'string') {
            // Serialize JavaScript
            options.postBody = net.serialize(options.postBody);
        }

        setHeaders();

        function send(){
            try {
                request.send(options.postBody);
            } catch (e) {
                if(options.error) {
                    options.error();
                }
            }
        }

        chain = {
            set : function(key, value) {
                options.headers[key] = value;
                return chain;
            },

            send : function(data, callback) {
                options.postBody = net.serialize(data);
                options.callback = callback;
                send();
                return chain;
            },

            data : function(data){
                options.postBody = net.serialize(data);
                return chain;
            },

            end : function(callback){
                options.callback = callback;
                send();
                return chain;
            },

            then : function(){
                chain.end();
                if(promise)
                    promise.then.apply(promise, arguments);
                return chain;
            }
        };

        return chain;
    } //end ajax function

    function JSONPCallback(url, success, failure) {
        var self = this;
        this.url = url;
        this.methodName = '__xo_jsonp_' + parseInt(new Date().getTime());
        this.success = success;
        this.failure = failure;

        function runCallback(json){
            self.success();
            self.teardown();
        }

        window[this.methodName] = runCallback;
    }

    JSONPCallback.prototype.run = function(){
        this.scriptTag = document.createElement('script');
        this.scriptTag.id = this.methodName;
        this.scriptTag.src = this.url.replace('{callback}', this.methodName);
        document.body.appendChild(this.scriptTag);
    };

    JSONPCallback.prototype.teardown = function(){
        window[this.methodName] = null;
        delete  window[this.methodName];
        if(this.scriptTag)
            document.body.removeChild(this.scriptTag);
    };


    /**
     *  An Ajax GET Request
     *
     *      $xo.get('/get-test')
     *          .set('Accept', 'text/html')
     *          .end(function(res){
     *              assert.equal('Result : ', res.respondText);
     *          });
     *
     * @param {String} url The URL to request
     * @param {Object} options The Ajax request options
     * @returns {Object} A chainable object for further configuration
     */
    net.get = function(url, options) {
        if(typeof options === 'undefined')
            options = {};

        options.method = 'get';
        return ajax(url, options);
    };


    /**
     * An Ajax POST request.
     *
     *      $xo.post('/post-test')
     *        .data({ key: 'value' })
     *        .end(function(res) {
     *          assert.equal('value', res.responseText);
     *        });
     *
     * @param {String} url The URL to request
     * @param {Object} options The Ajax request options (`postBody` may come in handy here)
     * @returns {Object} An object for further chaining with promises
     */
    net.post = function(url, options) {
        if(typeof options === 'undefined')
            options = {};

        options.method = 'post';
        return ajax(url, options);
    };

    /**
     * A jsonp request.  Example:
     *
     *     var url = 'http://example.url.com/json/';
     *     url += 'result/javascript?callback={callback}';
     *
     *     xo.net.jsonp(url, {
     *       success: function(json) {
     *         console.log(json);
     *       }
     *     });
     *
     * @param {String} url The URL to request
     */
    net.jsonp = function(url, options){
        if(typeof options === 'undefined')
            options = {};

        var callback = new JSONPCallback(url, options.success, options.failure);
        callback.run();
    };

    /**
     * The Ajax methods are mapped to the `xo` object:
     *
     *      xo.get();
     *      xo.post();
     *      xo.json();
     *
     */
    xo.get = net.get;
    xo.post = net.post;
    xo.jsonp = net.jsonp;

    net.ajax = ajax;

    xo.net = net;
});
