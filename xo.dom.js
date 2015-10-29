/**
 * Created by madcat on 10/29/15.
 *
 * XO DOM & Selector Engine Module
 *
 *
 * xo.dom.find ( '.class' )                     // return elements wrapped in a class without looking at each of
 *    .find ( 'a' )                             // find elements that are links
 *    .css ({ 'background-color': '#aabbcc'})   // apply the style by actually processing elements
 *
 */

define('xo.dom',['xo.core'], function(xo) {
    var dom = {},
        InvalidFinder = Error,
        find, matchMap, findMap, filter, getStyle, setStyle, tokenMap, // APIs
        macros, rules, nodeTypes, cssNumericalProperty, booleanAttributes, getAttributeParamFix, propertyFix, // Constants | Configuration
        scannerRegExp; // Scanner RegExp Class

    /**
     * Lexical scanner ( Grammar of CSS 2.1 )
     * More detail : http://www.w3.org/TR/CSS21/grammar.html
     *
     * @type {{nl: string, w: string, nonascii: string, num: string, unicode: string, escape: string, nmchar: string, nmstart: string, ident: string, name: string, string1: string, string2: string, string: string}}
     */
    macros = {
        'nl': '\n|\r\n|\r|\f',
        'w': '[\s\r\n\f]*',
        'nonascii': '[^\0-\177]',
        'num': '-?([0-9]+|[0-9]*\.[0-9]+)',
        'unicode': '\\[0-9A-Fa-f]{1,6}(\r\n|[\s\n\r\t\f])?',
        'escape': '#{unicode}|\\[^\n\r\f0-9A-Fa-f]',
        'nmchar': '[_A-Za-z0-9-]|#{nonascii}|#{escape}',
        'nmstart': '[_A-Za-z]|#{nonascii}|#{escape}',
        'ident': '[-@]?(#{nmstart})(#{nmchar})*',
        'name': '(#{nmchar})+',
        'string1': '"([^\n\r\f"]|#{nl}|#{nonascii}|#{escape})*"',
        'string2': "'([^\n\r\f']|#{nl}|#{nonascii}|#{escape})*'",
        'string': '#{string1}|#{string2}'
    };

    rules = {
        'name and id': '(#{ident}##{ident})',
        'id': '(##{ident})',
        'class': '(\\.#{ident})',
        'name and class': '(#{ident}\\.#{ident})',
        'element': '(#{ident})',
        'pseudo class': '(:#{ident})'
    };

    getAttributeParamFix = {
        width: true,
        height: true,
        src: true,
        href: true
    };

    nodeTypes = {
        ELEMENT_NODE: 1,
        ATTRIBUTE_NODE: 2,
        TEXT_NODE: 3,
        CDATA_SECTION_NODE: 4,
        ENTITY_REFERENCE_NODE: 5,
        ENTITY_NODE: 6,
        PROCESSING_INSTRUCTION_NODE: 7,
        COMMENT_NODE: 8,
        DOCUMENT_NODE: 9,
        DOCUMENT_TYPE_NODE: 10,
        DOCUMENT_FRAGMENT_NODE: 11,
        NOTATION_NODE: 12
    };

    cssNumericalProperty = {
        'zIndex': true,
        'fontWeight': true,
        'opacity': true,
        'zoom': true,
        'lineHeight': true
    };

    booleanAttributes = {
        'selected': true,
        'readonly': true,
        'checked': true
    };

    propertyFix = {
        tabindex: 'tabIndex',
        readonly: 'readOnly',
        'for': 'htmlFor',
        'class': 'className',
        maxlength: 'maxLength',
        cellspacing: 'cellSpacing',
        cellpadding: 'cellPadding',
        rowspan: 'rowSpan',
        colspan: 'colSpan',
        usemap: 'useMap',
        frameborder: 'frameBorder',
        contenteditable: 'contentEditable'
    };

    xo.addDetectionTest('classList', function () {
        var div = document.createElement('div');

        if (div.classList) {
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
    function scanner() {
        function replacePattern(pattern, patterns) {
            var matched = true,
                match;

            while (matched) {
                match = pattern.match(/#\{([^}]+)\}/);
                if (match && match[1]) {
                    pattern = pattern.replace(new RegExp('#\{' + match[1] + '\}', 'g'), patterns[match[1]]);
                    matched = true;
                } else {
                    matched = false;
                }
            }

            return pattern;
        }

        function escapePattern(text) {
            return text.replace(/\//g, '//');
        }

        function convertPatterns() {
            var key, pattern, results = {}, patterns, source;

            if (arguments.length == 2) { // convertPattern(source, patterns)
                source = arguments[0];
                patterns = arguments[1];
            } else { // convertPattern(patterns)
                source = arguments[0];
                patterns = arguments[0];
            }

            for (key in patterns) {
                pattern = escapePattern(replacePattern(patterns[key], source));

                results[key] = pattern;
            }

            return results;
        }

        function joinPatterns(regexps) {
            var results = [], key;
            for (key in regexps) {
                results.push(regexps[key]);
            }

            return new RegExp(results.join('|'), 'g');
        }

        return joinPatterns(
            convertPatterns(convertPatterns(macros), rules)
        );
    } // end scanner class

    scannerRegExp = scanner(); // is instance of RegExp Class

    /**
     * Find prototype
     * @type {{byId: Function, byNodeName: Function, byClassName: Function}}
     */
    find = {
        byId : function(root, id) {
            if(root === null) return [];
            return [root.getElementById(id)];
        },

        byNodeName : function(root, tagName) {
            if(root === null) return [];

            var i, results = [], nodes = root.getElementsByTagName(tagName);
            for(i = 0; i < nodes.length; i++) {
                results.push(nodes[i]);
            }

            return results;
        },

        byClassName : function(root, className){
            if(root === null) return [];

            var i, results = [], nodes = root.getElementsByTagName('*');
            for(i = 0; i < nodes.length; i++) {
                if(nodes[i].className.match('\\b' + className + '\\b')) {
                    results.push(nodes[i]);
                }
            }

            return results;
        }
    };

    /**
     * Selector engine
     * @type {{id: Function, name and id: Function, name: Function, class: Function, name and class: Function}}
     */
    findMap = {
        'id' : function(root, selector) {
            selector = selector.split("#")[1];
            return find.byId(root, selector);
        },

        //({name}#{id})
        // (div#hello)
        'name and id' : function(root, selector) {
            var matches = selector.split('#'),// => [{name}, {id}]
                name, id;
            name = matches[0];
            id = matches[1];

            return filter.byAttr(find.byId(root, id), 'nodeName', name.toUpperCase());
        },

        'name' : function(root, selector) {
            return find.byNodeName(root, selector);
        },

        'class' : function(root, selector) {
            selector = selector.split('\.')[1];
            return find.byClassName(root, selector);
        },

        'name and class' : function(root, selector) {
            var matches = selector.split('\.'),
                name, className;
            name = matches[0];
            className = matches[1];

            return filter.byAttr(find.byClassName(root, className), 'className', name.toUpperCase());
        }
    };

    // If supported document.getElementsByClassName
    if(typeof document !== 'undefined' && typeof document.getElementsByClassName !== 'undefined') {
        find.byClassName = function(root, className) {
            return root.getElementsByClassName(className);
        }
    }

    /**
     *
     * @type {{byAttr: Function}}
     */
    filter = {
        byAttr : function(elements, attribute, value) {
            var key, results = [];

            for(key in elements) {
                if(elements[key] && elements[key][attribute] === value) {
                    results.push(elements[key]);
                }
            }

            return results;
        }
    };


    matchMap = {
        'id' : function(element, selector) {
            selector = selector.split("#")[1];
            return element && element.id === selector;
        },

        'name' : function(element, nodeName) {
            return element && element.nodeName === nodeName.toUpperCase();
        },

        'name and id' : function(element, selector) {
            return matchMap.id(element, selector) && matchMap.name(element, selector.split("#")[0]);
        },

        'class' : function(element, selector) {
            if(element && element.className) {
                selector = selector.split('\.')[1];
                return element.className.match('\\b' + selector + '\\b');
            }
            return null;
        },

        'name and class' : function(element, selector) {
            return matchMap['class'](element, selector) && matchMap.name(element, selector.split('\.')[0]);
        }
    };




    /**
     * Tokens are used by the Tokenizer
     * @param identity
     * @param finder
     * @constructor
     */
    function Token(identity, finder) {
        this.identity = identity;
        this.finder = finder;
    }

    Token.prototype.toString = function(){
        return 'identity: ' + this.identity + ', finder: ' + this.finder;
    };

    /**
     * Tokenizer Class : classify sections of the scanner output
     *
     * @param selector
     * @constructor
     */
    function Tokenizer(selector) {
        this.selector = selector;
        this.tokens = [];
        this.tokenize();
    }
    Tokenizer.prototype.tokenize = function(){
        var match, r, finder;
        r = scannerRegExp;
        r.lastIndex = 0;

        while(match = r.exec(this.selector)) {
            finder = null;

            if(match[0]) {
                finder = 'id';
            } else if (match[1]) {
                finder = 'name and id';
            } else if (match[29]) {
                finder = 'name';
            } else if (match[15]) {
                finder = 'class';
            } else if (match[20]) {
                finder = 'name and class';
            }
            this.tokens.push(new Token(match[0], finder));
        }
        return this.tokens;
    };

    Tokenizer.prototype.finders = function(){
        var i, results = [];
        for(i in this.tokens) {
            results.push(this.tokens[i].finder);
        }
        return results;
    };




    /**
     *
     * @param root
     * @param tokens Tokenizer
     * @constructor
     */
    function Searcher(root, tokens){
        this.root = root;
        this.key_selector = tokens.pop();
        this.tokens = tokens;
        this.results = [];
    }

    Searcher.prototype.matchesToken = function(element, token) {

    }
});