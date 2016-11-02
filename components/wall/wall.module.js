angular.module('Wall', [])
    .config(ConfigWall)
    .run(['AuthService', '$rootScope', '$location', function (AuthService, $rootScope, $location) {
        $rootScope.$on('$routeChangeStart', function (event, next) {
            if (next.auth) {
                if (!AuthService.isAuth())
                    $location.path('/signin');
            }
        });

    }])
    .controller('WallController', WallController)
    .service('AuthService', AuthService)
    .service('WallService', WallService)
    .directive('wallAdd', function () {
        return {
            templateUrl: 'components/wall/add.html'
        }
    })
    .directive('editPost', function () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'components/wall/edit.html'
        }
    })
    .directive('editComment', function () {
        return {
            restrict: 'E',
            template: '<div ng-show="commentShow" class="col-md-offset-1 col-md-11">' +
            '<form ng-submit="update()" name="editCommentForm" novalidate="novalidate">' +
            '<div class="form-group"><textarea ng-model="editComment.text" class="form-control" ' +
            'ng-minlength="1" required rows="1"></textarea></div>' +
            '     <button type="submit"' +
            '     class="btn btn-primary btn-sm">update</button>' +
            '  <button ng-click="cancel()" class="btn btn-primary btn-sm ">cancel</button>' +
            '</form></div>',
            scope: {
                comment: '=',
                callback: '=',
                commentShow: '=commentShow'
            },
            controller: ['$scope', function ($scope) {
                $scope.editComment = angular.copy($scope.comment);

                $scope.update = update;
                $scope.cancel = cancel;

                function cancel() {
                    $scope.commentShow = false;
                    $scope.callback($scope.comment);
                }

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
            template: '<div class="col-md-12">' +
            '     <div class="row">' +
            '         <div class="col-md-12">{{post.text}}</div>' +
            '             <div style="margin-left: 0" class="row">' +
            '                 <div ng-repeat="image in post.images" class="col-xs-8 col-md-4">' +
            '                     <a class="thumbnail">' +
            '                         <img src="{{imageBasePath + image.path}}">' +
            '                     </a>' +
            '                 </div>' +
            '             </div>' +
            '     </div>' +
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