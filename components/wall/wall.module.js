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
    })
    .directive('editComment', function () {
        return {
            restrict: 'E',
            template:  '<div ng-show="commentShow" class="col-md-offset-1 col-md-11">'  +
            '     <textarea ng-model="editComment.text" class="form-control" rows="1"></textarea>'  +
            '     <button ng-click="update()" type="button"'  +
            '     class="btn btn-primary btn-sm">update</button>'  +
            '  <button ng-click="commentShow = false" class="btn btn-primary btn-sm ">cancel</button>'  +
            '</div>' ,
            scope: {
                comment: '=',
                callback: '=',
                commentShow: '=commentShow'
            },
            controller: ['$scope', function ($scope) {
                $scope.update = update;
                $scope.editComment = angular.copy($scope.comment);
                
                function update() {
                    $scope.commentShow = false;
                    $scope.callback($scope.editComment);
                }
            }]
        }
    })
    .directive('postContent', function () {
        return {
            restrict: 'E',
            template:  '<div class="col-md-12">'  +
            '     <div class="row">'  +
            '         <div class="text col-md-12">{{post.text}}</div>'  +
            '         <div class="images col-md-12">'  +
            '             <div class="row">'  +
            '                 <div ng-repeat="image in post.images" class="col-xs-8 col-md-4">'  +
            '                     <a class="thumbnail">'  +
            '                         <img src="{{imageBasePath + image.path}}">'  +
            '                     </a>'  +
            '                 </div>'  +
            '             </div>'  +
            '         </div>'  +
            '     </div>'  +
            '</div>',
            scope: {
                post: '=post',
                imageBasePath: '=imageBasePath'
            }
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