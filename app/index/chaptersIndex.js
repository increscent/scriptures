scripturesApp.config(function ($routeProvider) {
	$routeProvider
		.when('/:work/:book/chapters', {
			templateUrl: 'app/index/chaptersIndex.tpl.html',
			controller: 'chaptersIndexController'
		});
})

.controller('chaptersIndexController', function ($scope, $location, $routeParams, indexFactory, numpadFactory) {
	var work_abbr = $routeParams.work;
	var book_abbr = $routeParams.book;
	$scope.chapters = indexFactory.getBooks(work_abbr, book_abbr);
	
	$scope.numpad = numpadFactory;
	$scope.numpad.placeholder = '(1 chapter)';
	$scope.numpad.click = function (n) {
		console.log($scope.numpad.value);
	};
	
	$scope.goToChapter = function (chapter_index) {
		$location.path('/' + work_abbr + '/' + book_abbr + '/' + chapter_index);
	};
});