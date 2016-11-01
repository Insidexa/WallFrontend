SERVER_URL = 'http://wall-backend.jashka/';
API_URL = SERVER_URL + 'api';
ROOT_PATH = '/wall';
MAX_COUNT_IMAGES = 5;

angular.module('App', [
    'satellizer',
    'ngRoute',

    'Wall',
    'Auth'
])
    .config(ConfigApp)
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
    .factory('WSFactory', function () {

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
                processData = JSON.stringify(data);
            }

            ws.send(processData);
        }

        function onClose(event) {
            if (event.wasClean) {
                console.log('Соединение закрыто чисто');
            } else {
                console.log('Server unavailable'); // например, "убит" процесс сервера
            }
            console.log('Код: ' + event.code + ' причина: ' + event.reason);
        }

        return {
            init: init,
            send: send,
            close: onClose
        }
    })
    .factory('httpRequestInterceptor', function () {
        return {
            request: function (config) {

                //config.headers['Access-Control-Allow-Origin'] = '*';


                return config;
            }
        };
    })
    .directive('uploadImage', function () {
        return {
            restrict: 'E',
            template: '<input onchange="angular.element(this).scope().onLoadImage(this)" type="file" multiple="multiple" >',
            scope: {
                imageCallback: '=imageCallback'
            },
            controller: ['$scope', function ($scope) {
                $scope.onLoadImage = onLoadImage;

                function onLoadImage(input) {
                    if (input.files && input.files[0]) {
                        if (input.files.length > 5) {
                            alert('max ' + MAX_COUNT_IMAGES + ' files');
                        } else {
                            angular.forEach(input.files, function (file) {
                                var reader = new FileReader();
                                reader.readAsDataURL(file);
                                reader.onload = function (e) {
                                    $scope.imageCallback(e.target.result);
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

    //$httpProvider.interceptors.push('httpRequestInterceptor');
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