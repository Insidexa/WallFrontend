angular.module('Wall', [])
    .config(ConfigWall)
    .run(['AuthService', '$rootScope', '$location', function (AuthService, $rootScope, $location) {
        $rootScope.$on('$routeChangeStart', function (event, next) {
            if (next.auth) {
                //if (!AuthService.isAuth())
                  //  $location.path('/signin');
            }
        });

    }])
    .controller('WallController', WallController)
    .service('AuthService', AuthService)
    .directive('wallAdd', function () {
        return {
            templateUrl: 'components/wall/add.html'
        }
    });

ConfigWall.$inject = ['$routeProvider'];
function ConfigWall($routeProvider) {

    $routeProvider
        .when(ROOT_PATH, {
            templateUrl: 'components/wall/wall.html',
            controller: WallController,
            controllerAs: 'wall',
            auth: true
        });
}