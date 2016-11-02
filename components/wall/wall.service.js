
WallService.$inject = ['$http'];
function WallService($http) {
    var service = this;
    
    service.getWalls = function () {
        return $http.get(API_URL + '/walls').then(function (response) {
            return response.data;
        });  
    };
    
    service.removeWall = function (id) {
        $http.delete(API_URL + '/walls/' + id);
    };
    
    service.updateWall = function (data) {
        $http.patch(API_URL + '/walls/' + data.id, data).then(function (response) {
            return response.data;
        });
    };
    
    service.addWall = function (data) {
        $http.post(API_URL + '/walls', data).then(function (response) {
            return response;
        });
    };
    
    service.addComment = function (data) {
        $http.post(API_URL + '/comments', data).then(function (response) {
            return response;
        });
    };
    
    service.updateComment = function (data) {
        $http.patch(API_URL + '/comments/' + data.id, data);
    };

    service.removeComment = function (id, wallId) {
        $http.delete(API_URL + '/comments/' + id + '/' + wallId);
    };
    
    service.noInteresting = function (id) {
        $http.post(API_URL + '/ignores/', {
            id: id
        });
    };
    
    service.like = function (data) {
        $http.post(API_URL + '/likes/', data);  
    };
}