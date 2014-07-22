scripturesApp

.directive('stopPropagation', function () {
	return {
		scope: {
			'stopPropagation': '='
		},
		link: function (scope, element) {
			element.bind('click', function (event) {
				if (scope.stopPropagation) {
					event.stopPropagation();
				}
			});
		}
	};
});