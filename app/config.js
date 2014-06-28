var scripturesApp = angular.module('scripturesApp', ['ngRoute']);

scripturesApp.config(function ($routeProvider) {
    $routeProvider
        .when('/works', {
            templateUrl: 'app/templates/worksIndex.html',
            controller: 'worksIndexController'
        })
        .otherwise({redirectTo: '/works'});
});