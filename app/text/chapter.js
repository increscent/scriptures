scripturesApp.config(function ($routeProvider) {
	$routeProvider
		.when('/:work/:book/:chapter', {
			templateUrl: 'app/text/chapter.tpl.html',
			controller: 'chapterController'
		});
})

.controller('chapterController', function ($scope, $location, $routeParams, indexFactory, numpadFactory, textFactory) {
	var work_abbr = $routeParams.work;
	var book_abbr = $routeParams.book;
	var chapter = $routeParams.chapter;
	
	textFactory.getChapter(work_abbr, book_abbr, chapter, function (data) {
		$scope.chapter = "Chapter " + chapter;
		$scope.name = data.book_name;
		$scope.extendedSummary = data.extended_summary;
		$scope.summary = data.summary;
		$scope.moreSummary = data.more_summary;
		$scope.verses = data.verses;
		
		$scope.$apply();
	});
	
	// preload rest of book
	textFactory.loadBook(work_abbr, book_abbr);
});