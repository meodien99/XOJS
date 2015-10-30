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
});