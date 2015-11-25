/**
 * Created by madcat on 11/19/15.
 */
/**
 * Contains everything relating to the `require` module.
 */
define('xo.require',['xo.core'], function(xo){
    var appendTo = document.head || document.getElementsByTagName('head'),
        scriptOptions = ['async', 'defer', 'src', 'text'];

    /**
     * Used to determine if a script is from the same origin.
     *
     * @param {String} src Path to a script
     * @return {Boolean} True when `src` is from the same origin
     */
    function isSameOrigin(src){
        return src.charAt(0) === '/' || src.indexOf(location.protocol + '//' + location.host) !== -1 || false;
    }

    /**
     * Creates a script tag from a set of options.
     *
     * Options may include: `async`, `defer`, `src`, and `text`.
     *
     * @param {Object} options The options
     * @return {Object} The script tag's DOM object
     */
    function createScript(options){
        var script = document.createElement('script'), key;

        for(key in scriptOptions){
            key = scriptOptions[key];

            if(options[key]){
                script[key] = options[key];
            }
        }

        return script;
    }

    /**
     * Inserts a script tag into the document.
     *
     * @param script {String} The script tag
     */
    function insertScript(script) {
        appendTo.insertBefore(script, appendTo.firstChild);
    }


    /**
     * Loads scripts using XMLHttpRequest.
     *
     * @param scriptSrc {String} The script path
     * @param options {Object} A configuration object
     * @param fn {Function} A callback
     */
    function requireWithXMLHttpRequest(scriptSrc, options, fn){
        if(!isSameOrigin(scriptSrc)){
            throw ('Script load with XMLHttpRequest must be from the same origin');
        }

        if(!xo.get){
            throw('Loading scripts with XMLHttpRequest requires xo.net to be loaded');
        }

        xo
            .get(scriptSrc)
            .end(function(res){
                options.text = res.responseText;
            });
    }

    function Queue(sources){
        this.sources = sources;
        this.events = new xo.events.Emitter();
        this.queue = [];
        this.currentGroup = 0;
        this.groups = {};
        this.groupKeys = [];
        this.parseQueue(this.sources, false, 0);

        this.pointer = 0;
        this.preloadCount = 0;

        var self = this;
    }

    Queue.prototype = {
        parseQueue : function(sources, async, level){
            var i, source;
            for(i = 0; i < sources.length; i++){
                source = sources[i];
                if(xo.isArray(source)){
                    this.currentGroup++;
                    this.parseQueue(source, true, level + 1);
                } else {
                    if( level === 0 ){
                        this.currentGroup++;
                    }
                    this.enqueue(source, async);
                }
            }
        },

        enqueue : function(source, async){
            var preload = isSameOrigin(source);
            var options;

            options = {
                src : source,
                async : async,
                preload : preload,
                group : this.currentGroup
            };

            if(!this.groups[this.currentGroup]){
                this.groups[this.currentGroup] = [];
                this.groupKeys.push(this.currentGroup);
            }

            this.groups[this.currentGroup].push(options);
        }
    }
});