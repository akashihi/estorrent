'use strict';

var estorrentSearch = angular.module('estorrent.search', [
    'elasticsearch'
]);

estorrentSearch.service('client', function (esFactory) {
    return esFactory({
        host: {
            host: document.location.hostname,
            port: 80,
            path: "/es"
        },
        apiVersion: '1.5'
    });
});

estorrentSearch.controller('SearchCtl', function ($scope, client) {
    //Initial load
    $scope.selectedSubCategories = {};
    $scope.filterCategories = {};
    $scope.filterSubCategories = {};
    $scope.pageNo = 0;
    $scope.loading = false;
    client.search({
        index: 'tpb',
        type: 'torrent',
        body: ejs.Request().agg(ejs.TermsAggregation('categories').field('Category'))
    }).then(function (resp) {
        $scope.categories = resp.aggregations.categories.buckets;
    }).catch(function () {
        $scope.categories = null;
    });

    $scope.categoryClick = function (category) {
        /* Mark button */
        category.active = !category.active;

        /* Reload sub categories list */
        $scope.filterCategories = [];
        $scope.categories.forEach(function (item) {
            if (item.active) {
                $scope.filterCategories.push(item.key);
            }
        });

        if ($scope.filterCategories.length > 0) {
            $scope.loading = true;
            client.search({
                index: 'tpb',
                type: 'torrent',
                body: ejs.Request().agg(ejs.FilterAggregation('SubCategoryFilter').filter(ejs.TermsFilter('Category', $scope.filterCategories)).agg(ejs.TermsAggregation('categories').field('Subcategory').size(50)))
            }).then(function (resp) {
                    $scope.SubCategories = resp.aggregations.SubCategoryFilter.categories.buckets;
                    //Restore selection
                    $scope.SubCategories.forEach(function (item) {
                        if ($scope.selectedSubCategories[item.key]) {
                            item.active = true;
                        }
                    });
                }
            ).catch(function () {
                $scope.SubCategories = null;
            });
        } else {
            $scope.selectedSubCategories = {};
            $scope.filterSubCategories = [];
        }

        $scope.searchClick();
    };

    $scope.subCategoryClick = function (subCategory) {
        /* Mark button */
        subCategory.active = !subCategory.active;

        /* Prepare sub categories filter */
        $scope.selectedSubCategories = {};
        $scope.filterSubCategories = [];
        $scope.SubCategories.forEach(function (item) {
            if (item.active) {
                $scope.selectedSubCategories[item.key] = true;
                $scope.filterSubCategories.push(item.key);
            }
        });

        $scope.searchClick();
    };

    $scope.searchClick = function () {
        $scope.searchResults = [];
        $scope.pageNo = 0;
        $scope.doSearch();
    };

    $scope.doSearch = function () {
        $scope.loading = true;
        client.search({
            index: 'tpb',
            type: 'torrent',
            body: $scope.buildQuery()
        }).then(function (resp) {
                $scope.searchResults = $scope.searchResults.concat(resp.hits.hits);
            }
        ).finally(function() {
            $scope.loading = false;
        });

    };

    $scope.buildQuery = function () {
        var match = null;
        if ($scope.query) {
            if ($scope.useInfo) {
                match = ejs.MultiMatchQuery(['Title', 'Info'], $scope.query);
            } else {
                match = ejs.MatchQuery('Title', $scope.query);
            }
        } else {
            match = ejs.MatchAllQuery();
        }

        var filter = null;
        if ($scope.filterSubCategories.length > 0) {
            filter = ejs.TermsFilter('Subcategory', $scope.filterSubCategories);
        }
        if ($scope.filterCategories.length > 0) {
            var categoriesFilter = ejs.TermsFilter('Category', $scope.filterCategories);
            if (filter !== null) {
                filter = ejs.AndFilter([categoriesFilter, filter]);
            } else {
                filter = categoriesFilter;
            }
        }

        var request = ejs.Request();
        if (filter !== null) {
            request = request.query(ejs.FilteredQuery(match, filter));
        } else {
            request = request.query(match);
        }

        request = request.from($scope.pageNo*10);

        return request;
    };

    $scope.nextPage = function() {
        $scope.pageNo = $scope.pageNo +1;
        $scope.doSearch();
    };

    $scope.searchClick();
});

