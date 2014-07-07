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
	$scope.chapters = indexFactory.getChapters(work_abbr, book_abbr);
	
	$scope.numpad = numpadFactory;
	//placeholder text
	$scope.numpad.placeholder = '(' + $scope.chapters + ' chapters)';
	$scope.numpad.value = '';
	$scope.numpad.click = function (n) {
		if (n === 'clear') {
			$scope.numpad.value = '';
		} else if (n === 'submit') {
			$scope.goToChapter($scope.numpad.value);
		} else {
			var new_value = $scope.numpad.value.toString() + n.toString();
			$scope.numpad.value = parseInt(new_value);
			
			if ($scope.numpad.value * 10 > $scope.chapters) {
				$scope.goToChapter($scope.numpad.value);
			}
		}
	};
	
	$scope.goToChapter = function (chapter_index) {
		if (chapter_index !== 0 && chapter_index !== '' && chapter_index <= $scope.chapters) {
			$location.path('/' + work_abbr + '/' + book_abbr + '/' + chapter_index);
		}
	};
	
	// if there is only one chapter then skip this view
	if ($scope.chapters === 1) {
		$scope.goToChapter(1);
	}
});