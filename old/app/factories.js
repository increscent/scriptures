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
	factory.numpadRange = ['1','2','3','4','5','6','7','8','9'];
	factory.getNumpad = function () {
		var element = '<div class="numpad">';
		element += '</div>';
	};
	return factory;
})

.factory('textFactory', function ($http) {
	var factory = {};
	factory.loadBook = function (work, book, callback) {
		if (localStorage[work + book]) {
			if (typeof callback === 'function') {
				return callback(JSON.parse(localStorage[work + book]));
			}
		} else {
			$http.get('/' + work + '/' + book + '/' + book).
				success(function (data, status) {
					localStorage[work + book] = JSON.stringify(data);
					if (typeof callback === 'function') {
						return callback(JSON.parse(localStorage[work + book]));
					}
				});
		}
	};
	factory.getBook = function (work, book, callback) {
		factory.loadBook(work, book, function (data) {
			return callback(data);
		});
	};
	factory.getChapter = function (work, book, chapter, callback) {
		if (localStorage[work + book]) {
			return callback(JSON.parse(localStorage[work + book])[chapter.toString()]);
		} else {
			$http.get('/' + work + '/' + book + '/' + book + chapter).
				success(function (data, status) {
					return callback(data);
				});
		}
	};
	return factory;
});