'use strict';

// Declare app level module which depends on views, and components
angular.module('estorrent', [
    'ui.bootstrap',
    'estorrent.search'
]).
config([
    '$compileProvider',
    function ($compileProvider) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|magnet):/);
    }
]).
config(['$sceProvider', function ($sceProvider) {
    $sceProvider.enabled(false);
}]);
