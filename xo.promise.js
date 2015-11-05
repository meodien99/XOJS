/**
 * Created by madcat on 11/4/15.
 *
 *  The XO Promise module.
 */

define('xo.promise', ['xo.core'], function(xo){
    function PromiseModile(global){

        /**
         * Promise Class
         * @constructor
         */
        function Promise(){
            var self = this;
            this.pending = [];


            /**
             * Resolves a promise
             *
             * @param result
             */
            this.resolve = function(result){
                self.complete('resolve', result);
            };

            /**
             * Reject a promise
             *
             * @param result
             */
            this.reject = function(result){
                self.complete('reject', result);
            }
        }

        Promise.prototype = {
            /**
             * Adds a success and failure handler for completion of this Promise object.
             *
             * @param {Function} success The success handler
             * @param {Function} failure The failure handler
             * @returns {Promise} `this`
             */
            then : function(success, failure) {
                this.pending.push({
                    resolve : success,
                    reject : failure
                });
            },
            /**
             * Run through each pending 'thenable' based on type (resolve, reject)
             *
             * @param type
             * @param result
             */
            complete : function (type, result) {
                while(this.pending[0]){
                    this.pending.shift()[type](result);
                }
            }
        };

        /**
         * Chained Promises:
         *
         *     global().delay(1000).then(function() {
         *       assert.ok((new Date()).valueOf() - start >= 1000);
         *     });
         *
         */

        var chain = {};

        xo.init(function(){
            if(arguments.length === 0)
                return chain;
        });

        xo.delay = function(ms){
            var p = new xo.Promise();
            setTimeout(p.resolve, ms);
            return p;
        };

        global.Promise = Promise;
    }

    if(typeof module !== 'undefined') {
        module.exports = function(t){
            return PromiseModile(t);
        };
    } else {
        PromiseModile(xo);
    }

    return xo.Promise;
});
