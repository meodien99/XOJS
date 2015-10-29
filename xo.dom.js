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

    /**
     * Lexical scanner ( Grammar of CSS 2.1 )
     * More detail : http://www.w3.org/TR/CSS21/grammar.html
     *
     * @type {{nl: string, w: string, nonascii: string, num: string, unicode: string, escape: string, nmchar: string, nmstart: string, ident: string, name: string, string1: string, string2: string, string: string}}
     */
    macros = {
        'nl':        '\n|\r\n|\r|\f',
        'w':         '[\s\r\n\f]*',
        'nonascii':  '[^\0-\177]',
        'num':       '-?([0-9]+|[0-9]*\.[0-9]+)',
        'unicode':   '\\[0-9A-Fa-f]{1,6}(\r\n|[\s\n\r\t\f])?',
        'escape':    '#{unicode}|\\[^\n\r\f0-9A-Fa-f]',
        'nmchar':    '[_A-Za-z0-9-]|#{nonascii}|#{escape}',
        'nmstart':   '[_A-Za-z]|#{nonascii}|#{escape}',
        'ident':     '[-@]?(#{nmstart})(#{nmchar})*',
        'name':      '(#{nmchar})+',
        'string1':   '"([^\n\r\f"]|#{nl}|#{nonascii}|#{escape})*"',
        'string2':   "'([^\n\r\f']|#{nl}|#{nonascii}|#{escape})*'",
        'string':    '#{string1}|#{string2}'
    };

    rules = {
        'name and id':    '(#{ident}##{ident})',
        'id':             '(##{ident})',
        'class':          '(\\.#{ident})',
        'name and class': '(#{ident}\\.#{ident})',
        'element':        '(#{ident})',
        'pseudo class':   '(:#{ident})'
    };

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


    /**
     * Expanding #{} in the macros
     * Expanding #{} in the rules based on the expand macros
     * Escaping the backslashes
     * Joining each of the patterns with |
     * Building a global regex with RegExp class
     * @returns {*}
     */
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

        function escapePattern(text){
            return text.replace(/\//g, '//');
        }

        function convertPatterns() {
            var key, pattern, results = {}, patterns, source;

            if(arguments.length == 2) { // convertPattern(source, patterns)
                source = arguments[0];
                patterns = arguments[1];
            } else { // convertPattern(patterns)
                source = arguments[0];
                patterns = arguments[0];
            }

            for(key in patterns) {
                pattern = escapePattern(replacePattern(patterns[key], source));

                results[key] = pattern;
            }

            return results;
        }

        function joinPatterns(regexps) {
            var results = [], key;
            for(key in regexps) {
                results.push(regexps[key]);
            }

            return new RegExp(results.join('|'), 'g');
        }

        return joinPatterns(
            convertPatterns(convertPatterns(macros), rules)
        );
    } // end scanner class



});