var scripturesApp = angular.module('scripturesApp', ['ngRoute']);

scripturesApp.config(function ($routeProvider, $locationProvider) {
	$routeProvider
		.otherwise({redirectTo: '/works'});
});