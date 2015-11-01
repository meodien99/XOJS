/**
 * Created by madcat on 10/30/15.
 *
 *
 * The Turing Events module.
 *
 */

define('xo.events', ['xo.core', 'xo.dom'], function(xo) {
    var events = {}, // Event Object
        cache = [],
        onReadyBound = false,
        isReady = false,
        DOMContentLoaded,
        readyCallbacks = [],
        Emitter;

    function isValidElement(element) {
        return element.nodeType !== 3 && element.nodeType !== 0;
    }

    //created a private function to extend and fix event objects. This essentially patches IE and adds stop()
    function stop(event) {
        event.preventDefault();
        event.stopPropagation();
    }

    function fix(event, element) {
        if (!event) {
            var event = window.event;
        }

        event.stop = function () {
            stop(event);
        };

        if (typeof event.target === 'undefined')
            event.target = event.srcElement || element;

        if (!event.preventDefault)
            event.preventDefault = function(){ event.returnValue = false; };

        if(!event.stopPropagation)
            event.stopPropagation = function(){ event.cancelBubble = true; };

        if(event.target && event.target.nodeType === 3)
            event.target = event.target.parentNode;

        if(event.pageX === null && event.clientX !== null){
            var doc = document.documentElement,
                body = document.body;

            event.pageX = event.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
            event.pageY = event.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc && doc.clientTop || body && body.clientTop || 0);
        }

        return event;
    }

    function createResponder(element, handler) {
        return function (event) {
            fix(event, element);
            return handler(event);
        };
    }

    function removeCacheResponder(element, type, handler) {
        var i = 0, responder, j = 0;
        for(j = 0; j < cache.length; j++) {
            if(cache[j].element !== element
                && cache[j].type !== type
                && cache[j].handler !== handler) {
                cache[i++] = cache[j];
            } else {
                responder = cache[j].responder;
            }
        }

        cache.length = i;
        return responder;
    }

    function ready(){
        if(!isReady) {
            // Make sure body exists
            if(!document.body){
                return setTimeout(ready, 13);
            }

            isReady = true;

            for(var i in readyCallbacks){
                readyCallbacks[i]();
            }

            //TODO:
            //When custom events work properly in IE:
            // events.fire(document, 'dom:ready')
        }
    }

    // This checks if DOM is ready recursively
    function DOMReadyScrollCheck(){
        if(isReady){
            return;
        }

        try {
            document.documentElement.doScroll('left');
        } catch(e){
            setTimeout(DOMReadyScrollCheck, 1);
            return;
        }

        ready();
    }

    // DOMContentLoaded cleans up listeners
    if(typeof document !== 'undefined') {
        if(document.addEventListener) {
            DOMContentLoaded = function(){
                document.removeEventListener('DOMContentLoaded', DOMContentLoaded, false);
                ready();
            };
        } else if(document.attachEvent) {
            DOMContentLoaded = function(){
                if(document.readyState === 'complete') {
                    document.detachEvent('onreadystatechange', DOMContentLoaded);
                    ready();
                }
            };
        }
    }

    function bindOnReady(){
        if(onReadyBound)
            return;
        onReadyBound = true;

        if(document.readyState === 'complete') {
            ready();
        } else if (document.addEventListener) {
            document.addEventListener('DOMContentLoaded', DOMContentLoaded, false);
            window.addEventListener('load', ready, false);
        } else if (document.attachEvent) {
            document.attachEvent('onreadystatechange', DOMContentLoaded);

            window.attachEvent('onload', ready);

            // Check to see if document is ready
            var toplevel = false;

            try {
                toplevel = window.frameElement == null;
            } catch(e) {

            }

            if(document.documentElement.doScroll && toplevel) {
                DOMReadyScrollCheck();
            }
        }
    }


    function IEType(type) {
        if(type.match(/:/)) {
            return type;
        }
        return 'on' + type;
    }

    /**
     * Bind an event to an element.
     *
     *      turing.events.add(element, 'click', function() {
   *        console.log('Clicked');
   *      });
     *
     * @param {Object} element A DOM element
     * @param {String} type The event name
     * @param {Function} handler The event handler
     */
    events.add = function(element, type, handler) {
        if (!isValidElement(element)) return;

        var responder = createResponder(element, handler);
        cache.push({ element: element, type: type, handler: handler, responder: responder });

        if (type.match(/:/) && element.attachEvent) {
            element.attachEvent('ondataavailable', responder);
        } else {
            if (element.addEventListener) {
                element.addEventListener(type, responder, false);
            } else if (element.attachEvent) {
                element.attachEvent(IEType(type), responder);
            }
        }
    };

    /**
     * Remove an event from an element.
     *
     *      turing.events.add(element, 'click', callback);
     *
     * @param {Object} element A DOM element
     * @param {String} type The event name
     * @param {Function} handler The event handler
     */
    events.remove = function(element, type, handler) {
        if (!isValidElement(element)) return;
        var responder = removeCachedResponder(element, type, handler);

        if (document.removeEventListener) {
            element.removeEventListener(type, responder, false);
        } else {
            element.detachEvent(IEType(type), responder);
        }
    };
});