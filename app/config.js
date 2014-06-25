var scripturesApp = angular.module('scripturesApp', ['ng-route']);

scripturesApp.config(function ($routeProvider) {
    $routProvider
        .when('/', {
            templateUrl: 'app/templates/worksIndex.html',
            controller: 'worksIndexController'
        })
        .otherwise({redirectTo: '/'});
});