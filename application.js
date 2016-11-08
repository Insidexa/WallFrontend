SERVER_URL = 'http://185.14.187.188/';
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
    .factory('wallHttpInterceptor', WallHttpInterceptor)
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

WallHttpInterceptor.$inject = ['$q'];
function WallHttpInterceptor($q) {
    return {
        responseError: function(response) {

            switch (response.status) {
                case 400:
                        var messages = '';
                        angular.forEach(response.data.errors, function (errors) {
                            angular.forEach(errors, function (error) {
                                messages += error + '<br>';
                            });
                        });
                    
                    alert(messages);
                    break;
                
                case 500:
                    alert('Server unavailable');
                    break;
            }
            
            return $q.reject(response);
        }
    }
}

ConfigApp.$inject = ['$routeProvider', '$httpProvider'];
function ConfigApp($routeProvider, $httpProvider) {

    $httpProvider.interceptors.push('wallHttpInterceptor');
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