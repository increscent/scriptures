scripturesApp.controller('worksIndexController', function ($scope) {
    $scope.name = indexFactory.name;
    indexFactory.name = 'harry';
});

scripturesApp.controller('testController', function ($scope) {
    $scope.name = indexFactory.name;
});