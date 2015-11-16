/**
 * Created by madcat on 11/14/15.
 */
/**
 * Support for touchscreen devices.
 * Run `xo.touch.register()` to get touch event support.
 *
 * Tap:
 *
 *     xo.events.add(element, 'tap', function(e) {
 *       alert('tap');
 *     });
 *
 * Swipe:
 *
 *     xo.events.add(element, 'swipe', function(e) {
 *       alert('swipe');
 *     });
 *
 * Orientation Changes:
 *
 * Device orientation is available in `turing.touch.orientation()`.
 *
 *     xo.events.add(element, 'orientationchange', function(e) {
 *       alert('Orientation is now: ' + xo.touch.orientation());
 *     });
 */

define('xo.touch', ['xo.core', 'xo.dom', 'xo.events'], function(xo, dom, events){
    var touch = {},
        state = {};

    touch.swipeThreshold = 50;

    //Returns [orientation angle, orientation string]
    touch.orientation = function(){
        var orientation = window.orientation,
            orientationString = '';

        switch (orientation) {
            case 0:
                orientationString += 'portrait';
                break;

            case -90:
                orientationString += 'landscape left';
                break;

            case 90:
                orientationString += 'landscape left';
                break;

            case 180:
                orientationString += 'portrait upside-down';
                break;
        }

        return [orientation, orientationString];
    };

    function touchStart(e){
        state.touches = e.touches;
        state.startTime = e.startTime;
        state.x = e.changedTouches[0].clientX;
        state.y = e.changedTouches[0].clientY;
        state.startX = state.x;
        state.startY = state.y;
        state.target = e.target;
        state.duration = 0;
    }

    function touchEnd(e){
        var x = e.changedTouches[0].clientX,
            y = e.changedTouches[0].clientY;

        if(state.x === x && state.y === y && state.touches.length === 1) {
            xo.events.fire(e.target, 'tap');
        }
    }

    function touchMove(e){
        var moved = 0, touch = e.changedTouches[0];
        state.duration = (new Date).getTime() - state.startTime;
        state.x = state.startX - touch.pageX;
        state.y = state.startY - touch.pageY;

        moved = Math.sqrt(Math.pow(Math.abs(state.x), 2) + Math.pow(Math.abs(state.y), 2));

        if(state.duration < 1000 && moved > xo.touch.swipeThreshold) {
            xo.events.fire(e.target, 'swipe');
        }
    }

    // register must be called to register for touch event helpers
    touch.register = function(){
        xo.events.add(document, 'touchstart', touchStart);
        xo.events.add(document, 'touchmove', touchMove);
        xo.events.add(document, 'touchend', touchEnd);
    };

    xo.touch = touch;
    return xo.touch;
});