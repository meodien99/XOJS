/**
 * Created by madcat on 10/27/15.
 *
 * The XO Class
 *
 *  User = xo.Class({
 *      initialize : function(name, ago) {
 *          this.name = name;
 *          this.ago = ago;
 *      }
 *  });
 *
 *  new User('Mad Cat', 22);
 *
 * Inheritance
 *
 * Pass an object to XO Class to inherit from it
 *
 *  SuperUser = xo.Class(User, {
 *      initialize : function(){
 *          this.$super('initialize', arguments);
 *      },
 *
 *      toString : function(){
 *          return "SuperUser : " + this.$super('toString');
 *      }
 *  });
 *
 * Mixin
 *
 * Objects can be embedded within each other :
 *
 *  MixinUser = xo.Class({
 *      include : User,
 *
 *      initialize : function(log){
 *          this.log = log;
 *      }
 *  });
 *
 **/

define('xo.oo', ['xo.core'], function(xo){
    var Class, oo;
    Class = function(){
        return oo.create.apply(this, arguments);
    };

    oo = {

        $super : function(parentClass, instance, method, args) {
            return parentClass[method].apply(instance, args);
        },

        extend : function(destination, source) {
            for(var property in source) {
                if(source.hasOwnProperty(property))
                    destination[property] = source[property];
            }

            return destination;
        },

        create : function() {
            var methods = null,
                parent = undefined,
                aClass = function(){
                    this.$super = function(method, args) {
                        return oo.$super(this.$parent, this, method, args);
                    };
                    this.initialize.apply(this, arguments);
                };

            if(typeof arguments[0] === 'function') {
                parent = arguments[0];
                methods = arguments[1];
            } else {
                methods = arguments[0];
            }

            if(typeof parent !== 'undefined') {
                oo.extend(aClass.prototype, parent.prototype);
                aClass.prototype.$parent = parent.prototype;
            }

            oo.mixin(aClass, methods);
            // copy the passed in methods
            oo.extend(aClass.prototype, methods);

            // set the constructor
            aClass.prototype.constructor = aClass;

            // if there's no initialize method, set an empty one
            if(!aClass.prototype.initialize) {
                aClass.prototype.initialize = function (){};
            }

            return aClass;
        },

        mixin : function(aClass, methods) {
            if(typeof methods.include !== 'undefined') {
                if(typeof methods.include === 'function' ) {
                    oo.extend(aClass.prototype, methods.include.prototype);
                } else {
                    for(var i = 0; i < methods.include.length; i ++) {
                        oo.extend(aClass.prototype, methods.include[i].prototype);
                    }
                }
            }
        }
    };

    xo.Class = Class;
    xo.oo = oo;
    return oo;
});


