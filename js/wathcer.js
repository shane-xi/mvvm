function Watcher(vm, exp, callback) {
	this.vm = vm;
	this.callback = callback;
	this.exp = exp;
	this.eventLoopIds = {};
	this.value = this.get();
}
Watcher.prototype = {
	constructor: Watcher,
	update: function () {
		this.run();
	},
	run: function () {
		var value = this.get();
		var oldVal = this.value;
		if (value !== oldVal) {
			this.value = value;
			this.callback.call(this.vm, value, oldVal);
		}
	},
	get: function () {
		EventLoop.target = this;
		var value = getVMVal(this.vm, this.exp);
		Event.target = null;
		return value;
	},
	addEventLoop: function (eventLoop) {
		if (!this.eventLoopIds.hasOwnProperty(eventLoop.id)) {
			eventLoop.on(this);
			this.eventLoopIds[eventLoop.id] = eventLoop;
		}
	}
}

function getVMVal(vm, exp) {
	return parseObj(vm, exp) || '';
}
//当对象Key也一个对象时
function parseObj(obj, str) {
	var val = obj;
	str.replace('[', '.').replace(']', '').split('.')
		.forEach(function (key) {
			val = val[key]
		});
	return val
}