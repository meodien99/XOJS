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