scripturesApp.config(function ($routeProvider) {
	$routeProvider
		.when('/works', {
			templateUrl: 'app/index/worksIndex.tpl.html',
			controller: 'worksIndexController'
		});
})

.controller('worksIndexController', function ($scope, $location, indexFactory) {
	$scope.works = indexFactory.getWorks();
	
	$scope.goToBook = function (work_abbr) {
		$location.path('/' + work_abbr + '/books');
	};
	// retain original ordering
	$scope.notSorted = indexFactory.notSorted;
});