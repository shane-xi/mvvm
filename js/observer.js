function observer(data) {
    if (!data || typeof data !== 'object') {
        return;
    }
    Object.keys(data).forEach(function(key, index) {
        defineReactive(data, key, data[key])
    })
}

function defineReactive(data, key, value) {
    observer(value);
    var eventloop = new EventLoop();
    Object.defineProperty(data, key, {
        enumerable: true,
        configurable: true,
        get: function() {
            //监听

            if (EventLoop.target) {
                EventLoop.on(EventLoop.target)
            }
            return value;
        },
        set: function(newValue) {
            eventloop.emit()
        }
    })
}

function EventLoop() {
    this.loop = [];
}
EventLoop.prototype.on = function(sub) {
    this.loop.push(sub)
}
EventLoop.prototype.emit = function() {
    this.loop.forEach(function(sub) {
        sub.update();
    })
}
EventLoop.target = null;