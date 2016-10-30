angular.module('Auth', [])
    .config(AuthConfig);

AuthConfig.$inject = ['$authProvider', '$routeProvider'];
function AuthConfig($authProvider, $routeProvider) {
    $authProvider.loginUrl = API_URL + '/signin';
    $authProvider.signupUrl = API_URL + '/signup';

    $routeProvider
        .when('/signin', {
            templateUrl: 'components/auth/signin.html',
            controller: SignInController,
            controllerAs: 'signin'
        })
        .when('/signup', {
            templateUrl: 'components/auth/signup.html',
            controller: SignUpController,
            controllerAs: 'signup'
        });
}