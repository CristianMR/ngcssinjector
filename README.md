=============
ngCssInjector
=============

Load multiple css files in AngularJS with promises. This module by default load your CSS only one time. When you change to another page and insert new stylesheets, ngCssInjector enable some of those files if were loaded before. In that way, if you added and disabled styles (without removed), the navigation becomes very fast.

> ###Bower:
> bower install ngcssinjector --save

====
How to use ?
====

1. Your angular's app must be defined on the HTML tag of your page

```html
<html ng-app="myApp"
```

2. Add the module "ngCssInjector" to your AngularJS apps
```javascript
     angular.module('myApp', ['ngCssInjector']);
```

3. Get this service where you want and add your css files in your HTML page ! Example here in a $routeProvider when resolve:
```javascript
     controller: 'OneController',
     resolve: {
        css: ['cssInjector', function(cssInjector){
            //This function return a promise
            return cssInjector.addMany(["/path/to/your/css/file.css", "/path/to/your/css/file2.css", "/path/to/your/css/file3.css"]);
        }]
     }
```

4. Maybe you want to show a page until resolve. When the promise is resolved, you can disable another stylesheets to avoid conflicts:
```javascript
     function OneController($scope, cssInjector){
         //Disable many at once
         cssInjector.disableMany(["/path/to/your/css/file4.css", "/path/to/your/css/file5.css"]);
         //Disable only one
         cssInjector.disable("/path/to/your/css/file6.css");
     }
```

5. To disable all added CSS files when the page change (in a single page application), configure the `cssInjectorProvider`:
```javascript
	 myApp.config(function(cssInjectorProvider){
	 	 cssInjectorProvider.setSinglePageMode(true);
	 });
```

6. To disable manually all added CSS files, call the function `disableAll`:
```javascript
     function OneController($scope, cssInjector){
         cssInjector.disableAll();
     }
```

7. Also, you can remove CSS files in this way:
```javascript
     function OneController($scope, cssInjector){
         //Remove all
         cssInjector.removeAll();
         //Remove many at once
         cssInjector.removeMany(["/path/to/your/css/file4.css", "/path/to/your/css/file5.css"]);
         //Remove only one
         cssInjector.removeOne("/path/to/your/css/file6.css")
     }
```

===
Warning
===

If some CSS file doesn't load, the promise will be resolve anyway.