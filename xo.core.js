/**
 * Created by madcat on 10/27/15.
 */
(function(global){
    var xo = {
        VERSION : '0.0.1'
    };


    if(global.xo) {
        throw new Error('Xo has already been defined');
    } else {
        global.xo = xo;
    }
})(typeof window === 'undefined' ? this : window);

