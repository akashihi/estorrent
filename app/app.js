'use strict';

// Declare app level module which depends on views, and components
angular.module('estorrent', [
    'ui.bootstrap',
    'elasticui',
    'ngRoute',
    'estorrent.view1',
    'estorrent.view2',
    'estorrent.version'
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
]).
config(['$sceProvider', function ($sceProvider) {
    $sceProvider.enabled(false);
}])
