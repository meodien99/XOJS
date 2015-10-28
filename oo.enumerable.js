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

            /**
             * Removes items based on a callback :
             *
             *  var a = [1, 2, 3, 4, 5, 6];
             *  xo.enumerable.filter(a, function(n){
             *      return n % 2 === 0;
             *  });
             *
             *  => [2, 4, 6];
             *
             * @param enumerable A set of items that responds to `length`
             * @param callback The function to run over each item
             * @param context An optional parameter to determine `this` in the callback
             * @returns {Array} The filtered items
             */
            filter : function(enumerable, callback, context) {
                if(Array.prototype.filter && enumerable.filter === Array.prototype.filter)
                    return enumerable.filter(callback, context);

                var results = [],
                    pushIndex = !global.isArray(enumerable);

                global.enumerable.each(enumerable, function(value, index, list){
                    if(callback.call(context, value, index, list)){
                        if(pushIndex) {
                            results.push([index, value]);
                        } else {
                            results.push(value);
                        }
                    }
                });
                return results;
            },

            /**
             * The opposite of filter :
             *
             *  var a = [1, 2, 3, 4, 5, 6, 7, 8];
             *  xo.enumerable.reject(a, function(n){
             *      return n % 2 === 0;
             *  });
             *
             *  => [1, 3, 5, 7]
             *
             *
             * @param enumerable A set of items that responds to `length`
             * @param callback The function to run over each item
             * @param context An optional parameter to determine `this` in the callback
             * @returns {*|Array} The rejected items
             */
            reject : function(enumerable, callback, context) {
                return this.filter(enumerable, function(){
                    return !callback.apply(context, arguments);
                }, context);
            },

            /**
             * Find a single item :
             *
             *  var a = [1, 2, 3, 4, 5, 6, 7, 8];
             *  xo.enumerable.detect(a, function(n){
             *      return n === 3;
             *  });
             *
             *  => 3
             *
             *
             * @param enumerable A set of items that responds to `length`
             * @param callback The function to run over each item
             * @param context An optional parameter to determine `this` in the callback
             * @returns {Object} The item (if found)
             */
            detect : function(enumerable, callback, context) {
                var result;
                global.enumerable.each(enumerable, function(value, index, list){
                    if(callback.call(context, value, index, list)) {
                        result = value;
                        throw global.enumerable.Break;
                    }
                });

                return result;
            },

            /**
             * Runs a function over each item, collecting the results:
             *
             *  var a = [1, 2, 3, 4, 5, 6, 7, 8];
             *  xo.enumerable.reduce(a, 0, function(memo, n) {
             *      return memo + n;
             *  });
             *
             *  => 36
             *
             * @param enumerable
             * @param memo
             * @param callback
             * @param context
             * @returns {*}
             */
            reduce : function(enumerable, memo, callback, context) {
                if(Array.prototype.reduce && enumerable.reduce === Array.prototype.reduce)
                    return enumerable.reduce(global.bind(callback, context),memo);

                global.enumerable.each(enumerable, function(value, index, list){
                    memo = callback.call(context, memo, value, index, list);
                });

                return memo;
            },

            /**
             * Flattens multidimensional arrays:
             *
             *   var a = [[2, 4], [[6], 8]];
             *   xo.enumerable.flatten(a);
             *
             *   => [2, 4, 6, 8]
             *
             * @param {Object} enumerable A set of items that responds to `length`
             * @returns {Object} The flat array
             */
            flatten : function(array) {
                return global.enumerable.reduce(array, [], function(memo, value){
                    if(global.isArray(value))
                        return memo.concat(global.enumerable.flatten(value));

                    memo.push(value);
                    return memo;
                });
            },

            /**
             * Return the last item from a list
             *
             *  xo.enumerable.tail([1, 2, 3, 4, 5, 6], 3);
             *  => [4, 5, 6]
             *
             * @param {Object} enumerable A set of items that responds to `length`
             * @param {Number} start The index of the item to 'cut' the array
             * @returns {Array.<T>} A list of items
             */
            tail : function(enumerable, start) {
                start = typeof start === 'undefined' ? 1 : start;

                return Array.prototype.slice.apply(enumerable, [start]);
            },

            /**
             * Invokes `method` on a list of item:
             *  xo.enumerable.invoke(['hello','world'], 'substring', 0, 3);
             *  => ['hel', 'wor']
             *
             * @param enumerable
             * @param {Function} method The method to invoke on each item
             * @returns {Object} The changed list
             */
            invoke : function(enumerable, method) {
                var args = global.enumerable.tail(arguments, 2);

                return global.enumerable.map(enumerable, function(value) {
                    return (method ? value[method] : value).apply(value, args);
                });
            },

            /**
             * Pluck a property from each item of a list
             *
             *  xo.enumerable.pluck(['hello', 'world'], 'length');
             *  => [5, 5]
             *
             * @param enumerable A set of items that responds to `length`
             * @param {String} key The property to pluck
             * @returns {*|Array} The plucked properties
             */
            pluck : function(enumerable, key) {
                return global.enumerable.map(enumerable, function(value){
                    return value[key];
                });
            },

            /**
             * Determines if a list matches some items based on a callback:
             *
             *      xo.enumerable.some([1, 2, 3], function(value) {
             *        return value === 3;
             *      });
             *
             *      => true
             *
             * @param {Object} enumerable A set of items that responds to `length`
             * @param {Function} callback A function to run against each item
             * @param {Object} [context] An optional parameter to determine `this` in the callback
             * @returns {Boolean} True if an item was matched
             */
            some : function(enumerable, callback, context) {
                callback = callback || global.enumerable.identity;

                if(Array.prototype.some && enumerable.some === Array.prototype.some)
                    return enumerable.some(callback, context);

                var result = false;
                global.enumerable.each(enumerable, function(value, index, list){
                    if(result = callback.call(context, value, index, list)){
                        throw global.enumerable.Break;
                    }
                });

                return result;
            },

            /**
             * Checks if all items match the callback:
             *
             *      xo.enumerable.all([1, 2, 3], function(value) {
             *        return value < 4;
             *      })
             *
             *      => true
             *
             * @param {Object} enumerable A set of items that responds to `length`
             * @param {Function} callback A function to run against each item
             * @param {Object} [context] An optional parameter to determine `this` in the callback
             * @returns {Boolean} True if all items match
             */
            all : function(enumerable, callback, context) {
                callback = callback || global.enumerable.identity;
                if(Array.prototype.all && enumerable.prototype.all === Array.prototype.all)
                    return enumerable.all(callback, context);

                var result = true;
                global.enumerable.each(enumerable, function(value, index, list){
                    if(!(result = callback.call(context, value, index, list))) {
                        throw global.enumerable.Break;
                    }
                });

                return result;
            },

            /**
             * Checks if one item matches a value:
             *
             *      xo.enumerable.include([1, 2, 3], 3);
             *
             *      => true
             *
             * @param {Object} enumerable A set of items that responds to `length`
             * @param {Object} target A value to find
             * @returns {Boolean} True if an item was found
             */
            include : function(enumerable, target) {
                if(Array.prototype.indexOf && enumerable.indexOf === Array.prototype.indexOf)
                    return enumerable.indexOf(target) != -1;

                var found = false;
                global.enumerable.each(enumerable, function(value, key) {
                    if(found = value === target){
                        throw global.enumerable.Break;
                    }
                });

                return found;
            },

            /**
             * Chain enumerable calls:
             *
             *      xo.enumerable.chain([1, 2, 3, 4])
             *        .filter(function(n) { return n % 2 == 0; })
             *        .map(function(n) { return n * 10; })
             *        .values();
             *
             *      => [20, 40]
             *
             * @param {Object} enumerable A set of items that responds to `length`
             * @returns {Object} The chained enumerable API
             */
            chain: function(enumerable) {
                return new global.enumerable.Chainer(enumerable);
            },

            identity : function(value) {
                return value;
            }
        }; // end enumerable object

        /**
         *  Aliases
         */

        global.enumerable.select = global.enumerable.filter;
        global.enumerable.collect = global.enumerable.map;
        global.enumerable.inject = global.enumerable.reduce;
        global.enumerable.rest = global.enumerable.tail;
        global.enumerable.any = global.enumerable.some;
        global.enumerable.every = global.enumerable.all;

        global.chainableMethods = ['map', 'collect', 'detect', 'filter', 'reduce', 'each',
                                    'tail', 'rest', 'reject', 'plunk', 'any', 'some', 'all'];


        /**
         *  Chainer class
         */
        global.enumerable.Chainer = function(values){
            this.results = values;
        };

        global.enumerable.Chainer.prototype.values = function(){
            return this.results;
        };

        // Map selected methods by wrapping them in a closure that returns this each time
        global.enumerable.each(global.chainableMethods, function(methodName) {
            var method = global.enumerable[methodName];
            global.enumerable.Chainer.prototype[methodName] = function() {
                var args = Array.prototype.slice.call(arguments);
                args.unshift(this.results);

                this.results = method.apply(this, args);

                return this;
            };
        });

        global.init(function(arg){
            if(arg.hasOwnProperty.length && typeof arg !== 'string') {
                return global.enumerable.chain(arg);
            }
        });
    } // end EnumerableModule

    if(typeof module !== 'undefined') {
        module.exports = function(t){
            return EnumerableModule(t);
        }
    } else {
        EnumerableModule(xo);
    }
});