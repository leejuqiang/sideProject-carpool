exports.getQueue = function () {
    var queue = new Object();
    queue.functions = [];
    queue.params = [];
    queue.customCallbacks = [];
    queue.index = 0;
    queue.finish = null;

    queue.add = function(func, params, customCallback){
        queue.functions.push(func);
        queue.params.push(params);
        queue.customCallbacks.push(customCallback);
    }

    queue.callback = function () {
        if (queue.customCallbacks[queue.index] !== null) {
            queue.customCallbacks[queue.index](queue.params[queue.index]);
        }
        ++queue.index;
        if (queue.index < queue.functions.length) {
            queue.functions[queue.index](queue.params[queue.index], queue.callback);
        }
        else {
            if (queue.finish !== null) {
                queue.finish();
            }
        }
    }

    queue.exe = function () {
        queue.index = 0;
        queue.functions[0](queue.params[0], queue.callback);
    }
    return queue;
}