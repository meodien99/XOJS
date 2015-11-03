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
});
