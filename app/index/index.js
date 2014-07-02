scripturesApp.config(function ($routeProvider) {
    $routeProvider
        .when('/works', {
            templateUrl: 'app/index/worksIndex.tpl.html',
            controller: 'worksIndexController'
        })
})

.controller('worksIndexController', function ($scope, indexFactory) {
    $scope.works = indexFactory.getWorks();
    // retain original ordering
    $scope.notSorted = function(obj) {
        if (!obj) {
            return [];
        }
        return Object.keys(obj);
    };
});