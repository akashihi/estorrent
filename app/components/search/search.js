'use strict';

var estorrentSearch = angular.module('estorrent.search', [
    'ash',
    'elasticsearch'
]);

estorrentSearch.service('client', function (esFactory) {
    return esFactory({
        host: '192.168.75.5:9200',
        apiVersion: '1.5',
        log: 'trace'
    });
});

estorrentSearch.controller('SearchCtl', function ($scope, euiHost, client, esFactory) {
    //Initial load
    $scope.errorCategories = "Not yet loaded";
    client.search({
        index: 'tpb',
        type: 'torrent',
        body: ejs.Request().agg(ejs.TermsAggregation('categories').field('Category'))
    }).then(function (resp) {
        $scope.categories = resp.aggregations.categories.buckets;
        $scope.errorCategories = null;
    }).catch(function (err) {
        $scope.categories = null;
        $scope.errorCategories = err;
        // if the err is a NoConnections error, then the client was not able to
        // connect to elasticsearch. In that case, create a more detailed error
        // message
        if (err instanceof esFactory.errors.NoConnections) {
            $scope.errorCategories = new Error('Unable to connect to elasticsearch.');
        }
    });

    $scope.categoryClick = function(category) {
        category.active = !category.active
    }

    $scope.nextPage = function () {
        log.console("here")
        if (indexVM.pageCount <= indexVM.page) {
            return
        }
        indexVM.page = indexVM.page + 1;
    }
});
