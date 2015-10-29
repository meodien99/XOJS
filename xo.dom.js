/**
 * Created by madcat on 10/29/15.
 *
 * XO DOM & Selector Engine Module
 *
 */

define('xo.dom',['xo.core'], function(xo){
    var dom = {},
        InvalidFinder = Error,
        macros, rules, tokenMap,
        getAttributeParamFix;


    getAttributeParamFix = {
        width : true,
        height : true,
        src : true,
        href : true
    };

    xo.addDetectionTest('classList', function(){
        var div = document.createElement('div');

        if(div.classList) {
            return true;
        }

        div = null;
        return false;
    });

    function scanner(){
        function replacePattern(pattern, patterns) {
            var matched = true,
                match;

            while(matched) {
                match = pattern.match(/#\{([^}]+)\}/);
                if(match && match[1]){
                    pattern = pattern.replace(new RegExp('#\{' + match[1] + '\}', 'g'), patterns[match[1]]);
                    matched = true;
                } else {
                    matched = false;
                }
            }

            return pattern;
        }
    }

    function escapePattern(text){
        return text.replace(/\//g, '//');
    }

    function convertPatterns() {
        var key, pattern, results = {}, patterns, source;

        if(arguments.length == 2) {
            source = arguments[0];
            patterns = arguments[1];
        } else {
            source = arguments[0];
            patterns = arguments[0];
        }

        for(key in patterns) {
            pattern = escapePattern(replacePattern(patterns[key], source));

            results[key] = pattern;
        }

        return results;
    }
});