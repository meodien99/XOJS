/**
 * Created by madcat on 10/28/15.
 *
 * The Turing Enumerable module.
 *
 * This is bound to DOM objects:
 *
 *     global('p').each(function() {
 *       // `this` contains a DOM element
 *     });
 *
 */
define('xo.enumerable', ['xo.core'], function(xo){

    function EnumerableModule(global) {
        global.enumerable = {
            /**
             * Throw to break out of iterators
             * */
            Break : {},

            /**
             * Iterators using a function over a set of items. Example :
             *
             *  xo.enumerable.each([1,2,3], function(n){
             *   console.debug(n);
             *  });
             *
             * @param {Object} enumerable A set of items that responds to `length`
             * @param {Function} callback The function to run
             * @param {Object} [context] An optional parameter to determine `this` in the callback
             * @returns {Object} The passed in enumerable object
             *
             */
            each : function(enumerable, callback, context){
                var hasOwnProperty = Object.prototype.hasOwnProperty;

                try {
                    if(Array.prototype.forEach && enumerable.forEach === Array.prototype.forEach) {
                        enumerable.forEach(callback, context);
                    } else if (global.isNumer(enumerable.length)) {
                        for(var i = 0; i < enumerable.length; i++) {
                            callback.call(enumerable, enumerable[i], i, enumerable);
                        }
                    } else {
                        for( var key in enumerable) {
                            if(hasOwnProperty.call(enumerable, key)) {
                                callback.call(context, enumerable[key], key, enumerable);
                            }
                        }
                    }
                } catch (e) {
                    if(e != global.enumerable.Break)
                        throw e;
                }
                return enumerable;
            },

            /***
             * Changes a set of item using a function. Example:
             *
             * xo.enumerable.map([1, 2, 3], function(n) {
             *  return n + 1;
             * }); // => [2,3,4]
             *
             * @param enumerable A set of items that responds to `length`
             * @param callback The function to run over each item
             * @param context An optional parameter to determine `this` in the callback
             * @returns {Array} The changed items
             */
            map : function(enumerable, callback, context) {
                if(Array.prototype.map && enumerable.map === Array.prototype.map)
                    return enumerable.map(callback, context);
                var results = [];

                global.enumerable.each(enumerable, function(value, index, list){
                   results.push(callback.call(context, value, index, list));
                });

                return results;
            },

            filter : function(enumerable, callback, context) {


            }
        }
    }
});