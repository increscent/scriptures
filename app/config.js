var scripturesApp = angular.module('scripturesApp', []);

scripturesApp.config(function ($routeProvider) {
    $routProvider
        .when('/', {
            templateUrl: 'app/templates/worksIndex.html',
            controller: 'worksIndexController'
        })
        .otherwise({redirectTo: '/'});
});