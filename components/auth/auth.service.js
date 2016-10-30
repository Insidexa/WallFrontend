AuthService.$inject = ['$auth', '$location', 'LS'];
function AuthService($auth, $location, ls) {
    var service = this;

    service.getUser = function () {
        return ls.get('user');
    };

    service.isAuth = function () {
        return $auth.isAuthenticated();
    };

    service.logout = function () {
        $auth.logout();
        ls.rm('user');
        $location.path('/wall');
    }
}