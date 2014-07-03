scripturesApp.config(function ($routeProvider) {
	$routeProvider
		.when('/:work/:book/chapters', {
			templateUrl: 'app/index/chaptersIndex.tpl.html',
			controller: 'chaptersIndexController'
		});
})

.controller('chaptersIndexController', function ($scope, $location, $routeParams, indexFactory) {
	var work_abbr = $routeParams.work;
	var book_abbr = $routeParams.book;
	$scope.chapters = indexFactory.getBooks(work_abbr, book_abbr);
	
	$scope.goToChapter = function (chapter_index) {
		$location.path('/' + work_abbr + '/' + book_abbr + '/' + chapter_index);
	};
});