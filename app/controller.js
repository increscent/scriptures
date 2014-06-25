scripturesApp.controller('worksIndexController', function ($scope, indexFactory) {
    $scope.name = indexFactory.name;
    indexFactory.name = 'harry';
});

scripturesApp.controller('testController', function ($scope, indexFactory) {
    $scope.name = indexFactory.name;
});