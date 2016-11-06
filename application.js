SERVER_URL = 'http://localhost:8000/';
API_URL = SERVER_URL + 'api';
ROOT_PATH = '/wall';
MAX_COUNT_IMAGES = 5;

angular.module('App', [
    'satellizer',
    'ngRoute',
    'jcs-autoValidate',

    'Wall',
    'Auth'
])
    .config(ConfigApp)
    .run(['bootstrap3ElementModifier', 'validator',
        function (bootstrap3ElementModifier, validator) {
            validator.defaultFormValidationOptions.waitForAsyncValidators = false;
            validator.defaultFormValidationOptions.validateOnFormSubmit = true;
        bootstrap3ElementModifier.enableValidationStateIcons(true);
    }])
    .factory('LS', function () {
        var factory = {};

        factory.get = function (key) {
            var data = localStorage.getItem(key);

            if (data) {
                try {
                    data = JSON.parse(data);
                } catch (e) {
                }

                return data;
            } else {
                return null;
            }
        };

        factory.set = function (key, value) {
            var data = (typeof value == 'object') ? JSON.stringify(value) : value;
            localStorage.setItem(key, data);
        };

        factory.rm = function (key) {
            localStorage.removeItem(key);
        };

        return factory;
    })
    .directive('uploadImage', function () {
        return {
            restrict: 'E',
            template: '<input onchange="angular.element(this).scope().onLoadImage(this)" type="file" multiple="multiple" >',
            scope: {
                imageCallback: '=imageCallback',
                edit: '=?'
            },
            controller: ['$scope', function ($scope) {
                $scope.onLoadImage = onLoadImage;

                function onLoadImage(input) {
                    if (input.files && input.files[0]) {
                        if (input.files.length > MAX_COUNT_IMAGES) {
                            alert('max ' + MAX_COUNT_IMAGES + ' files');
                        } else {
                            angular.forEach(input.files, function (file) {
                                var reader = new FileReader();
                                reader.readAsDataURL(file);
                                reader.onload = function (e) {
                                    if (!$scope.edit)
                                        $scope.edit = 'wall';
                                    $scope.imageCallback(e.target.result, $scope.edit);
                                };
                            });
                        }
                    }
                }
            }]
        }
    });

ConfigApp.$inject = ['$routeProvider', '$httpProvider'];
function ConfigApp($routeProvider, $httpProvider) {

    $httpProvider.defaults.useXDomain = true;
    $httpProvider.defaults.withCredentials = true;
    delete $httpProvider.defaults.headers.common["X-Requested-With"];
    $httpProvider.defaults.headers.common["Accept"] = "application/json";
    $httpProvider.defaults.headers.common["Content-Type"] = "application/json";
    $httpProvider.defaults.headers.common["Access-Control-Allow-Origin"] = "*";

    $routeProvider
        .otherwise({
            redirectTo: ROOT_PATH
        });
}

Array.prototype.insert = function (index, item) {
    this.splice(index, 0, item);
};