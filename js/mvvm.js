function Sue(options) {
    this.$options = options;
    var data = this._data = this.$options.data;
    var $this = this;
    _proxyData($this, data);
    observer(data, $this);

    this.$compile = new Compile(options.el || document.body, $this);
}

Sue.prototype = {
    construtor: Sue,
    
}


function _proxyData(vm, data) {
    Object.keys(data).forEach(function(key) {
        Object.defineProperty(vm, key, {
            configurable: false,
            enumerable: true,
            get: function() {
                return vm._data[key];
            },
            set: function(newValue) {
                vm._data[key] = newValue;
            }
        })
    });
}