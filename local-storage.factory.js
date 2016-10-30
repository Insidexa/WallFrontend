function LocalStorageFactory() {
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
}