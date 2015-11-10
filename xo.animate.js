/**
 * Created by madcat on 11/7/15.
 *
 *
 * The animate method is `xo.anim.animate`.
 * The animate method animate CSS properties.
 *
 * There are also animation helper methods. like `xo.anim.fadeIn` or `xo.anim.move`.
 *
 * Examples :
 *
 *  Turn a paragraph red:
 *      xo.anim.animate($xo('p')[0], 2000,{
 *          'color': red
 *      });
 *
 *  Move a paragraph :
 *      xo.anim.animate($xo('p')[0], 2000, {
 *          'padding' : '400px'
 *      });
 *
 *  It's possible to chain animation module calls with `xo.anim.chain` .
 *
 *      xo('p').fadeIn(2000).animate(1000, {
 *          'margin': '100px'
 *      });
 *
 *      Or :
 *
 *      $xo('p').fadeIn(2000).animate(1000, {
 *          'margin': '100px'
 *      });
 *
 */

define('xo.anim', ['xo.core', 'xo.dom'], function(xo, dom){
    var anim = {},
        opacityType,
        methodName,
        CSSTransitions = {},
        easing = {},
        Chainer;

    /**
     * These CSS related functions should be moved into xo.css
     * @param property
     */
    function camelize(property) {
        return property.replace(/-+(.)?/g, function(match, chr){
            return chr ? chr.toUpperCase() : '';
        });
    }

    function getOpacityType(){
        // Filter on IE browser
        return (typeof document.body.style.opacity !== 'undefined') ? 'opacity' : 'filter';
    }

    function Color(value){
        this.r = 0;
        this.g = 0;
        this.b = 0;
        this.value = this.normalise(value);
        this.parse();
    }

    // Based on: http://www.phpied.com/rgb-color-parser-in-javascript/
    Color.matchers = [
        {
            re: /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/,
            example: ['rgb(123, 234, 45)', 'rgb(255,234,245)'],
            process: function (bits){
                return [
                    parseInt(bits[1], 10),
                    parseInt(bits[2], 10),
                    parseInt(bits[3], 10)
                ];
            }
        },
        {
            re: /^(\w{2})(\w{2})(\w{2})$/,
            example: ['#00ff00', '336699'],
            process: function (bits){
                return [
                    parseInt(bits[1], 16),
                    parseInt(bits[2], 16),
                    parseInt(bits[3], 16)
                ];
            }
        },
        {
            re: /^(\w{1})(\w{1})(\w{1})$/,
            example: ['#fb0', 'f0f'],
            process: function (bits) {
                return [
                    parseInt(bits[1] + bits[1], 16),
                    parseInt(bits[2] + bits[2], 16),
                    parseInt(bits[3] + bits[3], 16)
                ];
            }
        }
    ];

    Color.prototype.normalise = function(value){
        value.replace(/ /g, '');
        if(value.charAt(0) === '#') {
            value = value.substr(1, 6);
        }
        return value;
    };

    Color.prototype.parse = function() {
        var channels = [],
            i;
        for(i = 0; i < Color.matchers.length; i++){
            channels = this.value.match(Color.matches[i].re);
            if(channels) {
                channels = Color.matchers[i].process(channels);
                this.r = channels[0];
                this.g = channels[1];
                this.b = channels[2];
                break;
            }
        }

        this.validate();
    };

    Color.prototype.validate = function(){
        this.r = (this.r < 0 || isNaN(this.r) ? 0 : ((this.r > 255) ? 255 : this.r));
        this.g = (this.g < 0 || isNaN(this.g) ? 0 : ((this.g > 255) ? 255 : this.g));
        this.b = (this.b < 0 || isNaN(this.b) ? 0 : ((this.b > 255) ? 255 : this.b));
    };

    Color.prototype.sum = function(){
        return this.r + this.g + this.b;
    };

    Color.prototype.toString = function(){
        return 'rgb(' + this.r + ', ' + this.g + ', ' + this.b + ')';
    };



    function isColour(value){
        return typeof value === 'string' && value.match(/#[a-f|A-F|0-9]|rgb/);
    }

    function parseColor(value){
        return {
            value : new Color(value),
            units : '',
            transform : colourTransform
        };
    }

    function colourTransform (v, position, easingFunction){
        var colours = [];
        colours[0] = Math.round(v.base.r + (v.direction[0] * (Math.abs(v.base.r - v.value.r) * easingFunction(position))));
        colours[1] = Math.round(v.base.g + (v.direction[0] * (Math.abs(v.base.g - v.value.g) * easingFunction(position))));
        colours[2] = Math.round(v.base.b + (v.direction[0] * (Math.abs(v.base.b - v.value.b) * easingFunction(position))));

        return 'rgb(' + colours.join(', ') + ')';
    }

    function numericalTransform(parsedValue, position, easingFunction){
        return (easingFunction(position) * parsedValue.value);
    }

    function parseNumericalValue(value){
        var n = (typeof value === 'string') ? parseFloat(value) : value,
            units = (typeof value === 'string') ? value.replace(n, '') : '';

        return {
            value : n,
            units : units,
            transform : numericalTransform
        };
    }

    function parseCSSValue(value, element, property){
        if(isColour(value)) {
            var colour = parseColor(value),i;

            colour.base = new Color(element.style[property]);
            colour.direction = [colour.base.r < colour.value.r ? 1 : -1,
                                colour.base.g < colour.value.g ? 1 : -1,
                                colour.base.b < colour.value.b ? 1 : -1 ];
            return colour;
        } else if (typeof value !== 'object') {
            return parseNumericalValue(value);
        } else {
            return value;
        }
    }

    function setCSSProperty(element, property, value){
        if(property === 'opacity' && opacityType === 'filter') {
            element.style[opacityType] = 'alpha(opacity=' + Math.round(value*100) + ')';
            return element;
        }

        element.style[property] = value;
        return element;
    }

    //Easing Object
    easing.linear = function(position){
        return position;
    };

    easing.sine = function(position){
        return (-Math.cos(position * Math.PI) / 2) + 0.5;
    };

    easing.reverse = function(position){
        return 1.0 - position;
    };

    easing.spring = function(position){
        return 1 - (Math.cos(position * Math.PI * 4) * Math.exp(-position * 6));
    };

    easing.bounce = function(position){
        if(position < (1 / 2.75)) {
            return 7.6 * position * position;
        } else if (position < (2 / 2.75)) {
            return 7.6 * (position -= (1.5 / 2.75)) * position * 0.74;
        } else if (position < (2 / 2.75)) {
            return 7.6 * (position -= (2.25 / 2.75)) * position + 0.91;
        } else {
            return 7.6 * (position -= (2.625 / 2.75)) * position + 0.98;
        }
    };


    /**
     *  Animates an element using CSS properties
     *
     * @param {Object} element A DOM element
     * @param {Number} duration Duration in milliseconds
     * @param {Object} properties CSS properties to animate, for example: `{ width: '20px' }`
     * @param {Object} options Currently accepts an easing function or built-in easing method name (linear, sine, reverse, spring, bounce)
     */
    anim.animate = function(element, duration, properties, options){
        var start = new Date().valueOf(),
            finish = start + duration,
            easingFunction = easing.linear,
            interval, p;

        if(!opacityType){
            opacityType = getOpacityType();
        }

        options = options || {};
        if(options.hasOwnProperty('easing')) {
            if(typeof options.easing === 'string'){
                easingFunction = easing[options.easing];
            } else if (options.easing) {
                easingFunction = options.easing;
            }
        }
    };

    // Transition
    CSSTransitions = {
        // CSS3 vendor detection
        vendors : {
            // Opera Presto
            'opera' : {
                'prefix' : '-o-',
                'detector' : function(){
                    try {
                        document.createElement('OTransitionEvent');
                        return true;
                    } catch (e) {
                        return false;
                    }
                }
            },
            // Chrome
            'webkit' : {
                'prefix' : '-webkit-',
                'detector' : function(){
                    try {
                        document.createElement('WebKitTransitionEvent');
                        return true;
                    } catch (e) {
                        return false;
                    }
                }
            },
            // Firefox
            'firefox' : {
                'prefix' : '-moz-',
                'detector' : function(){
                    var div = document.createElement('div');
                    var supported = false;

                    if (typeof div.style.MozTransition !== 'undefined') {
                        supported = true;
                    }

                    div = null;
                    return supported;
                }
            }
        },

        vendorPrefix : null,


        findCSS3VendorPrefix : function(){
            var detector;
            for (detector in CSSTransitions.vendors){
                if(this.vendors.hasOwnProperty(detector)){
                    detector = this.vendors[detector];
                    if(detector.detector()){
                        return detector.prefix;
                    }
                }
            }
        },

        // CSS3 Transition
        start : function(element, duration, property, value, easing){
            element.style[camelize(this.vendorPrefix + 'transition')] = property + ' ' + duration + 'ms ' + (easing || 'linear');
            element.style[property] = value;
        },

        end : function(element, property){
            element.style[camelize(this.vendorPrefix + 'transition')] = null;
        }
    };

    CSSTransitions.vendorPrefix = CSSTransitions.findCSS3VendorPrefix();
});
