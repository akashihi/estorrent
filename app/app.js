'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
    'ui.bootstrap',
    'elasticui',
    'ngRoute',
    'myApp.view1',
    'myApp.view2',
    'myApp.version'
]).
constant('euiHost', 'http://192.168.75.5:9200').
config(['$routeProvider', function ($routeProvider) {
    $routeProvider.otherwise({redirectTo: '/view1'});
}]).
config([
    '$compileProvider',
    function ($compileProvider) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|magnet):/);
    }
])
