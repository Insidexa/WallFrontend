
SignInController.$inject = ['$auth', 'LS'];
function SignInController($auth, LS) {
    var vm = this;

    vm.user = {};

    vm.signin = signin;

    function signin() {
        $auth.login(vm.user).then(function (response) {
            LS.set('user', response.data.user);
            $auth.setToken(response.data.token);
            $location.path(ROOT_PATH);
        });
    }
}