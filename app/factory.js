scripturesApp.factory('indexFactory', function($http) {
	// (index is a global variable)
    var factory = {};
	factory.getWorks = function () {
		return index;
	};
	factory.getBooks = function (work) {
		return index[work];
	};
	factory.getChapters = function (work, book) {
		return index[work].books[book].chapters;
	};
	return factory;
});