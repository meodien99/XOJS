Riot.context('xo.core.js', function(){
    given('the xo object', function(){
        should('be global and accessible', xo).isNotNull();
        should('return a VERSION', xo.VERSION).isNotNull();
        should('be XO complete', true).isTrue();
    });
});