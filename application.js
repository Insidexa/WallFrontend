SERVER_URL = 'http://wall-backend.jashka/';
API_URL = SERVER_URL + 'api';
ROOT_PATH = '/wall';



angular.module('App', [
    'satellizer',
    'ngRoute',
    'flow',

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
                } catch (e) {}

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
            } else  if (angular.isObject(data)) {
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
    });

ConfigApp.$inject = ['$routeProvider'];
function ConfigApp($routeProvider) {

    $routeProvider
        .otherwise({
            redirectTo: ROOT_PATH
        });
}