/**
 * Created by madcat on 10/27/15.
 *
 * The XO core module
 */
(function(global){
    var middleware = [], xo, modules = {};

    /**
     * xo object, use xo('selector') for quick DOM access when built with the DOM module
     *
     * @return (Object) The XO object, run through `init`
     */
    xo = function(){
        var result, i;

        for(i = 0; i < middleware.length; i++) {
            result = middleware[i].apply(xo, arguments);

            if(result)
                return result;
        }
    };

    /**
     * Define VERSION
     * @type {string}
     */
    xo.VERSION = '0.0.1';

    /**
     * This alias will be used as an alternative to `xo()`
     *
     * If __xo_alias is present in the global scope, this will be used alternative
     */
    if(typeof window !== 'undefined') {
        xo.alias = window.__xo_alias || '$xo';
        window[xo.alias] = xo;
    }

    /**
     * Determine if an object is an `Array`.
     *
     * @type {*|Function}
     *
     * @param {Object} object An object that may or may not be an array
     * @returns {Boolean} True if the parameter is an array
     */
    xo.isArray = Array.isArray || function(object){
            return !!(object && object.concat && object.unshift && !object.callee);
        };

    /**
     * Convert an `Array`- like collection into an `Array`
     * @param collection
     * @returns {Array}
     */
    xo.toArray = function(collection){
        var results = [], i;
        for (i = 0; i < collection.length; i++) {
            results.push(collection[i]);
        }

        return results;
    };

    //this can be override by libraries that extend xo()
    xo.init = function(fn){
        middleware.unshift(fn);
    };

    /**
     * Determines if an object is a Number
     * @param object
     * @returns {boolean}
     */
    xo.isNumber = function(object){
        return (object === +object) || (toString.call(object) === ['object Number']);
    };

    /**
     * Binds a function to an object
     *
     * @param fn
     * @param object
     * @returns {Function}
     */
    xo.bind = function(fn, object){
        var slice = Array.prototype.slice,
            args = slice.apply(arguments, [2]);

        return function(){
            return fn.apply(object || {}, args.concat(slice.apply(arguments)));
        };
    };

    var testCache = {},
        detectionTests = {};

    /**
     * Use to add feature detection methods
     *
     * @param name The name of the test
     * @param fn The function that performs the test
     */
    xo.addDetectionTest = function(name, fn){
        if(!detectionTests[name]) {
            detectionTests[name] = fn;
        }
    };


    /**
     * Run a feature detection name;
     *
     * @param testName
     * @returns {Boolean} The outcome of the test
     */
    xo.detect = function(testName) {
        if(typeof testCache[testName] === 'undefined') {
            testCache[testName] = detectionTests[testName];
        }
        return testCache[testName];
    };

    xo.define = function(module, dependencies, fn) {
        if(typeof define === 'function' && define.amd){
            define(module, dependencies, fn);
        } else {
            if(dependencies && dependencies.length) {
                for(var i = 0; i < dependencies.length; i++) {
                    dependencies[i] = modules[dependencies[i]];
                }
            }
            modules[module] = fn.apply(this, dependencies || []);
        }
    };

    /**
     * Export `xo` based on environment.
     */

    global.xo = xo;

    if(typeof  exports !== 'undefined') {
        exports.xo = xo;
    }

    xo.define('xo.core', [], function(){
        return xo;
    });

    if(typeof define === 'undefined') {
        global.define = xo.define;
    }
})(typeof window === 'undefined' ? this : window);

