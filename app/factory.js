scripturesApp.factory('indexFactory', function() {
	// retrieve index
	var index = localStorage.index;
	if (localStorage.index) {
		index = JSON.parse(localStorage.index);
		console.log(index);
	} else {
		/*ajax_request('/index.json', '', function (data) {
			index = JSON.parse(data);
			console.log(index);
			localStorage.index = JSON.stringify(index);
		}); */
		
		var response = $http.get("/index.json");
		response.success(function(data, status, headers, config) {
			index = JSON.parse(data);
			console.log(index);
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