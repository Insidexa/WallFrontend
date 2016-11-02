angular.module('Auth', [])
    .config(AuthConfig)
    .controller('SignController', SignController);

AuthConfig.$inject = ['$authProvider', '$routeProvider'];
function AuthConfig($authProvider, $routeProvider) {
    $authProvider.loginUrl = API_URL + '/signin';
    $authProvider.signupUrl = API_URL + '/signup';

    $routeProvider
        .when('/signin', {
            templateUrl: 'components/auth/signin.html',
            controller: SignController,
            controllerAs: 'sign'
        })
        .when('/signup', {
            templateUrl: 'components/auth/signup.html',
            controller: SignController,
            controllerAs: 'sign'
        });
}

SignController.$inject = ['$auth', 'LS', '$location'];
function SignController($auth, LS, $location) {
    var vm = this;

    vm.user = {};

    vm.signin = signin;
    vm.signup = signup;

    function signup() {
        $auth.signup(vm.user).then(function (response) {
            console.log(response);
            //vm.signin();
        });
    }

    function signin() {
        $auth.login(vm.user).then(function (response) {
            LS.set('user', response.data.user);
            $auth.setToken(response.data.token);
            $location.path(ROOT_PATH);
        });
    }
}