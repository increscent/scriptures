scripturesApp.controller('worksIndexController', function ($scope, indexFactory) {
    $scope.works = indexFactory.getWorks();
    // retain original ordering
    $scope.notSorted = function(obj) {
        if (!obj) {
            return [];
        }
        return Object.keys(obj);
    };
});