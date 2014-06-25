var scripturesApp = angular.module('scripturesModule', []);

scripturesApp.config(function ($routeProvider) {
    $routProvider
        .when('/', {
            templateUrl: 'templates/worksIndex.html',
            controller: 'worksIndexController'
        })
        .otherwise({redirectTo: '/'});
});