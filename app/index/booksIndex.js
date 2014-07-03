scripturesApp.config(function ($routeProvider) {
	$routeProvider
		.when('/:work/books', {
			templateUrl: 'app/index/booksIndex.tpl.html',
			controller: 'booksIndexController'
		});
})

.controller('booksIndexController', function ($scope, $location, $routeParams, indexFactory) {
	var work_abbr = $routeParams.work;
	$scope.books = indexFactory.getBooks(work_abbr);
	
	$scope.goToChapters = function (book_abbr) {
		$location.path('/' + work_abbr + '/' + book_abbr + '/chapters');
	};
	// retain original ordering
	$scope.notSorted = indexFactory.notSorted;
});