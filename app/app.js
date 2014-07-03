var scripturesApp = angular.module('scripturesApp', ['ngRoute']);

scripturesApp.config(function ($routeProvider) {
	$routeProvider
		.otherwise({redirectTo: '/works'});
});