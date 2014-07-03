scripturesApp.factory('indexFactory', function () {
	// (index is a global variable)
	var factory = {};
	factory.getWorks = function () {
		return index;
	};
	factory.getBooks = function (work) {
		return index[work].books;
	};
	factory.getChapters = function (work, book) {
		return index[work].books[book].chapters;
	};
	factory.notSorted = function (obj) {
		if (!obj) {
			return [];
		}
		return Object.keys(obj);
	};
	return factory;
})

.factory('numpadFactory', function () {
	var factory = {};
	factory.getNumpad = function () {
		var element = '<div class="numpad">';
		element += '</div>';
	};
	return factory;
});