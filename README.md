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