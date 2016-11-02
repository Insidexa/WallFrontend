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
    .factory('WSFactory', ['LS', function (LS) {

        var ws = null;

        function init(onOPenCallback, onMessageCallback) {
            if (ws == null) {
                ws = new WebSocket('ws://localhost:8082');
                ws.onopen = onOPenCallback;
                ws.onmessage = onMessageCallback;
                ws.onclose = onClose;
                ws.onerror = onError;
            }
        }

        function onError(event) {
            console.log(event.message);
        }

        function send(data) {
            var processData = null;
            if (angular.isString(data)) {
                processData = data;
            } else if (angular.isObject(data)) {
                if (LS.get('satellizer_token') !== null)
                    data.token = LS.get('satellizer_token');
                processData = JSON.stringify(data);
            }

            ws.send(processData);
        }

        function onClose(event) {
            if (event.wasClean) {
                console.log('Соединение закрыто чисто');
            } else {
                console.log('Server unavailable');
            }
            console.log('Код: ' + event.code + ' причина: ' + event.reason);
        }

        return {
            init: init,
            send: send,
            close: onClose
        }
    }])
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