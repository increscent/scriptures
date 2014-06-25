scripturesApp.factory('indexFactory', function() {
    var factory = {};
    
    factory.name = 'robert';
    return factory;
    /*factory.getIndex = function (callback) {
        var index = localStorage.index;
        if (localStorage.index) {
		index = JSON.parse(localStorage.index);
		return callback(index);
	} else {
		ajax_request('/index.json', '', function (data) {
			index = JSON.parse(data);
			console.log(index);
			localStorage.index = JSON.stringify(index);
			return callback();
		});
	}
    }
    var response = $http.get("/index.json");

    response.success(function(data, status, headers, config) {
        $scope.myData.fromServer = data.title;
    });
    response.error(function(data, status, headers, config) {
    });*/
});