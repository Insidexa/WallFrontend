WebSocketFactory.$inject = [];
function WebSocketFactory() {

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
}