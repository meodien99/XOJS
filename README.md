# XOJS
XO.js Javascript framework like Jquery framework

#### About ####

XO is a javascript framework

Features included :

 * Classes, with extend and mixin
 * Events
 * Animation
 * AMD support
 * Chained design
 * Function programing methods : map, each, enum ....

### Basic usage ###
Define a class just simple as :
  ```html
 var User = xo.Class({
          initialize : function(name, ago) {
              this.name = name;
             this.ago = ago;
        }
     });
```
 And then feel free to call :
 ```html
  var user = new User("Adam");
 ```
### Inheritance  ###
 ```html
 SuperUser = xo.Class(User, {
       initialize : function(){
           this.$super('initialize', arguments);
       },

       toString : function(){
           return "SuperUser : " + this.$super('toString');
       }
   });
 ```
### Mixin##
 Objects can be embedded within each other :
 ```html
 MixinUser = xo.Class({
      include : User,
      initialize : function(log){
          this.log = log;
    }
  });
 ```
### Enumerable  ###
 ```html
 This is bound to DOM objects:
  
       global('p').each(function() {
         // `this` contains a DOM element
       });
 ```
 Enumerable support features :
### each ###
  ```html
    xo.enumerable.each([1,2,3], function(n){
                    console.debug(n);
                   });
  ```
### map  ###
  ```html
    xo.enumerable.map([1, 2, 3], function(n) {
               return n + 1;
              }); // => [2,3,4]
  ```
### filter ###
  ```html
    Removes items based on a callback :
             
               var a = [1, 2, 3, 4, 5, 6];
               xo.enumerable.filter(a, function(n){
                   return n % 2 === 0;
               });
             
               => [2, 4, 6];
  ```
    
    
 UPDATING...