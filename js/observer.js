function observer(data) {
	if (!data || typeof data !== 'object') {
		return;
	}
	Object.keys(data).forEach(function (key, index) {
		defineReactive(data, key, data[key])
	})
}

function defineReactive(data, key, value) {
	eventLoop = new EventLoop();
	observer(value);
	if (Array.isArray(value)) {
		value.__proto__ = newArrProto;
	}
	Object.defineProperty(data, key, {
		enumerable: true,
		configurable: true,
		get: function () {
			//监听
			if (EventLoop.target) {
				//eventLoop.on(EventLoop.target)
				eventLoop.depend();
			}
			return value;
		},
		set: function (newValue) {
			if (newValue === value) return;
			if (typeof newValue === 'object') {
				observer(newValue);
			}
			value = newValue;
			eventLoop.emit();
		}
	})
}
var count = 0;
function EventLoop() {
	this.id = count++;
	this.loop = [];
}
EventLoop.prototype.on = function (sub) {
	this.loop.push(sub)
}
EventLoop.prototype.emit = function () {
	this.loop.forEach(function (sub) {
		sub.update();
	})
}
EventLoop.prototype.depend = function () {
	EventLoop.target.addEventLoop(this);
}
EventLoop.target = null;


//监听数组变化实现

const arrProto = Object.create(Array.prototype)
const newArrProto = []
const arrMethod = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse']
arrMethod.forEach(function (method) {
	let originalMethod = arrProto[method]
	newArrProto[method] = function () {
		console.log(`我被改变了`)
		observer(this)
		//eventLoop.emit();
		return originalMethod.apply(this, arguments)
	}
})
let testArr = [1, 2, 3]
//不去粗暴地改变数组的原型方法，而是改变数组实例的原型方法
testArr.__proto__ = newArrProto
//为什么不用继承的方式重写一个数组呢？
//因为Array构造函数执行时不会对传进去的this做任何处理。不止Array，String,Number,Regexp,Object等等JS的内置类都不行。
//es6可以,详情可见http://es6.ruanyifeng.com/#docs/class-extends#原生构造函数的继承
class NewArray extends Array {
	constructor(...args) {
		super(...args)
	}
	push (...args) {
		console.log(`我被改变了`)
		return super.push(...args)
	}
}
