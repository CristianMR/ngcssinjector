/**
 * ngCssInjector 0.1.0
 * https://github.com/CristianMR/ngcssinjector
 * (c) Cristian Martín Rios 2014 | License MIT
 * Based on angular-css-injector v1.0.4, copyright (c) 2013 Gabriel Delépine
 */
'use strict';
angular.module('ngCssInjector', []).provider('cssInjector', [function() {
    var singlePageMode = false;

    function CssInjector($q, $rootScope, scope){
        var defers = {};

        // Capture the event `locationChangeStart` when the url change. If singlePageMode===TRUE, call the function `disableAll`
        $rootScope.$on('$locationChangeStart', function(){
            if(singlePageMode === true)
                disableAll();
        });

        // Used to add a CSS files in the head tag of the page, and return promise if true, else false
        var addStylesheet = function(href){
            if(scope.injectedStylesheets[href]) {
                enableStylesheet(href);
                return false;
            }
            scope.injectedStylesheets[href] = {disabled: false};

            var defer = $q.defer();
            defers[href] = defer;
            return defer.promise;
        };

        /**
         * Multiple styles plus promise when loaded all !
         */
        var addManyStylesheet = function(array){
            var deferAll = $q.defer();
            var promises = [];
            for(var i = 0; i < array.length; i++){
                var promise = addStylesheet(array[i]);
                if(promise){
                    promises.push(promise);
                }
            }

            $q.all(promises).then(deferAll.resolve, deferAll.reject);

            return deferAll.promise;
        };

        var enableStylesheet = function(href){
            if(scope.injectedStylesheets[href]) scope.injectedStylesheets[href].disabled = false;
        };

        var disableStylesheet = function(href){
            if(scope.injectedStylesheets[href]) scope.injectedStylesheets[href].disabled = true;
        };

        var disableManyStylesheet = function(array){
            if(scope.injectedStylesheets)
                for(var i = 0; i < array.length; i++){
                    disableStylesheet(array[i]);
                }
        };

        var disableAll = function(){
            if(scope.injectedStylesheets)
                for(var i = 0; i < scope.injectedStylesheets.length; i++)
                    disableStylesheet(scope.injectedStylesheets[i]);
        };

        var remove = function(href){
            if(scope.injectedStylesheets && scope.injectedStylesheets[href]){
                delete scope.injectedStylesheets[href];
            }
        };

        var removeMany = function(array){
            for(var i = 0; i < array.lenght; i++)
                remove(array[i]);
        };

        var removeAll = function(){
            scope.injectedStylesheets = {}; // Make it empty
        };

        //Resolve promise
        var loaded = function(href){
            if(defers[href]){
                defers[href].resolve();
                delete defers[href];
            }
        };

        return {
            add: addStylesheet,
            addMany: addManyStylesheet,
            disable: disableStylesheet,
            disableMany: disableManyStylesheet,
            disableAll: disableAll,
            remove: remove,
            removeAll: removeAll,
            removeMany: removeMany,
            loaded: loaded //used by cssInjectorCallback directive
        };
    }

    this.$get = ['$q', '$compile', '$timeout', '$rootScope', function($q, $compile, $timeout, $rootScope){
        var head = angular.element(document.getElementsByTagName('head')[0]);
        var scope = head.scope();
        if(scope === undefined)
            throw("ngCssInjector error : Please initialize your app in the HTML tag and be sure your page has a HEAD tag.");
        scope.injectedStylesheets = {};
        $timeout(function(){
            head.append($compile("<link data-ng-repeat='(key,value) in injectedStylesheets' data-ng-href='{{key}}' value='value.disabled' css-injector-callback rel='stylesheet'/>")(scope))
        });
        return new CssInjector($q, $rootScope, scope);
    }];

    this.setSinglePageMode = function(mode){
        singlePageMode = mode;
        return this;
    }
}]).directive('cssInjectorCallback', ['cssInjector', function (cssInjector) {
    return {
        scope: {
            value: '='
        },
        link: function(scope, element, attrs) {

            scope.$watch('value', function(value){
                element[0].disabled = value;//Enable or disable link element
            });

            element.bind('load', function () {
                cssInjector.loaded(attrs.href);
            });
            /*
             If error happend, that's okey :D
             */
            element.bind('error', function () {
                console.error('CSS INJECTOR: CSS NOT FOUND:', attrs.href);
                cssInjector.loaded(attrs.href);
            });
        }
    }
}]);