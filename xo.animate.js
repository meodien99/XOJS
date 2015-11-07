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

});
