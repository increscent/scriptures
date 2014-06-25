var scripturesApp = angular.module('scripturesApp', ['ngRoute']);

scripturesApp.config(function ($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'app/templates/worksIndex.html',
            controller: 'worksIndexController'
        })
        .when('/test', {
            templateUrl: 'app/templates/worksIndex.html',
            controller: 'testController'
        })
        .otherwise({redirectTo: '/'});
});