'use strict';

var estorrentSearch = angular.module('estorrent.search', [
    'elasticsearch'
]);

estorrentSearch.service('client', function (esFactory) {
    return esFactory({
        host: '192.168.75.5:9200',
        apiVersion: '1.5'
    });
});

estorrentSearch.controller('SearchCtl', function ($scope, client, esFactory) {
    //Initial load
    $scope.errorCategories = "Not yet loaded";
    $scope.selectedSubCategories = {};
    $scope.filterCategories = {};
    $scope.filterSubCategories = {};
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

    $scope.categoryClick = function (category) {
        /* Mark button */
        category.active = !category.active;

        /* Reload sub categories list */
        $scope.filterCategories = []
        $scope.categories.forEach(function (item) {
            if (item.active) {
                $scope.filterCategories.push(item.key)
            }
        });

        if ($scope.filterCategories.length > 0) {
            client.search({
                index: 'tpb',
                type: 'torrent',
                body: ejs.Request().agg(ejs.FilterAggregation('SubCategoryFilter').filter(ejs.TermsFilter('Category', $scope.filterCategories)).agg(ejs.TermsAggregation('categories').field('Subcategory').size(50)))
            }).then(function (resp) {
                    $scope.SubCategories = resp.aggregations.SubCategoryFilter.categories.buckets;
                    $scope.errorSubCategories = null;
                    //Restore selection
                    $scope.SubCategories.forEach(function (item) {
                        if ($scope.selectedSubCategories[item.key]) {
                            item.active=true
                        }
                    })
                }
            ).catch(function (err) {
                $scope.SubCategories = null;
                $scope.errorSubCategories = err;
                // if the err is a NoConnections error, then the client was not able to
                // connect to elasticsearch. In that case, create a more detailed error
                // message
                if (err instanceof esFactory.errors.NoConnections) {
                    $scope.errorSubCategories = new Error('Unable to connect to elasticsearch.');
                }
            });
        } else {
            $scope.selectedSubCategories = {};
            $scope.filterSubCategories = [];
        }

        $scope.searchClick();
    };

    $scope.subCategoryClick = function(subCategory) {
        /* Mark button */
        subCategory.active = !subCategory.active;

        /* Prepare sub categories filter */
        $scope.selectedSubCategories = {};
        $scope.filterSubCategories = [];
        $scope.SubCategories.forEach(function (item) {
            if (item.active) {
                $scope.selectedSubCategories[item.key] = true;
                $scope.filterSubCategories.push(item.key)
            }
        });

        $scope.searchClick();
    };

    $scope.searchClick = function(){
        client.search({
            index: 'tpb',
            type: 'torrent',
            body: $scope.buildQuery()
        }).then(function (resp) {
            $scope.searchResults = resp.hits.hits
            }
        ).catch(function (err) {
            $scope.errorResult = err;
            // if the err is a NoConnections error, then the client was not able to
            // connect to elasticsearch. In that case, create a more detailed error
            // message
            if (err instanceof esFactory.errors.NoConnections) {
                $scope.errorResult = new Error('Unable to connect to elasticsearch.');
            }
        });
    }

    $scope.buildQuery = function() {
        var match = null;
        if ($scope.query) {
            if ($scope.useInfo) {
                match = ejs.MultiMatchQuery(['Title', 'Info'], $scope.query)
            } else {
                match = ejs.MatchQuery('Title', $scope.query)
            }
        } else {
            match = ejs.MatchAllQuery()
        }

        var filter = null;
        if ($scope.filterSubCategories.length >0) {
            filter = ejs.TermsFilter('Subcategory', $scope.filterSubCategories)
        }
        if ($scope.filterCategories.length >0) {
            var categoriesFilter = ejs.TermsFilter('Category', $scope.filterCategories);
            if ( filter != null ) {
                filter = ejs.AndFilter([categoriesFilter, filter])
            } else {
                filter = categoriesFilter
            }
        }

        var request = ejs.Request();
        if (filter != null) {
            request = request.query(ejs.FilteredQuery(match, filter))
        } else {
            request = request.query(match)
        }

        return request
    }

    $scope.searchClick();
});

