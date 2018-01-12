function observer (data) {
	if (!data || typeof data !== 'object') {
		return
	}
	Object.keys(data).forEach(function (key) {
		defineReactive(data, key, data[key]);
	});
}
function defineReactive (data, key, value) {
	observer(value);
	Object.defineProperty(data, key, {
		enumerable: true,
		configurable: true,
		get: function () {
			return value;
		},
		set: function (newValue) {
			if (newValue === value) return;
			if (typeof newValue === 'object') {
				observer(newValue);
			}
			eventLoop.$dispatch(key, newValue);
			value = newValue;
		}
	})
}
var EventLoop = function () {
	this.loop = [];
}
EventLoop.prototype.$watch = function (key, callback) {
	var obj = {};
	obj[key] = callback;
	this.loop.push(obj)
}
EventLoop.prototype.$dispatch = function (key) {
	var args = Array.prototype.slice.call(arguments, 1);
	this.loop.forEach(function (item) {
		if (!item[key]) return;
		item[key].apply(undefined, args);
	})
}

var a = {
	name: 'wuxi',
	id: "123",
	test: {
		age: 22,
		demo: 11
	}
}
observer(a);

var eventLoop = new EventLoop();
eventLoop.$watch('id', function(newValue) {
	console.log(`id变为了${newValue}`);
})
eventLoop.$watch('test', function(newValue) {
	console.log(`test变为了${newValue}`);
})

a.test.demo = 13;
a.id = 231;