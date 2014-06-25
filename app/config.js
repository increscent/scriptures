var scripturesApp = angular.module('scripturesApp', []);

scripturesApp.config(function ($routeProvider) {
    $routProvider
        .when('/', {
            templateUrl: 'templates/worksIndex.html',
            controller: 'worksIndexController'
        })
        .otherwise({redirectTo: '/'});
});