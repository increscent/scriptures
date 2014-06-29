scripturesApp.factory('indexFactory', function() {
	// retrieve index
	var index = localStorage.index;
	if (localStorage.index) {
		index = JSON.parse(localStorage.index);
		console.log(index.ot_kjv);
	} else {
		var response = $http.get("/index.json");
		response.success(function(data, status, headers, config) {
			index = data;
			console.log(index.ot_kjv);
			localStorage.index = JSON.stringify(index);
		});
		response.error(function(data, status, headers, config) {
			console.log('index retrieval error');
		});
	}
	
    var factory = {};
	factory.name = 'robert';
	factory.getIndex = function () {
		return index;
	};
	return factory;
});