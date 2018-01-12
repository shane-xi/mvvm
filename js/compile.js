function Compile(el, vm) {
	this.$vm = vm;
	this.$el = isElement(el) ? el : document.querySelector(el);

	if (this.$el) {
		this.$fragment = node2Fragment(this.$el);
		this.init();
		this.$el.appendChild(this.$fragment);
	}
}

Compile.prototype = {
	constructor: Compile,
	init: function () {
		this.compile(this.$fragment);
	},
	compile: function (node) {
		var childNodes = node.childNodes;
		var $this = this;
		var reg = /\{\{([^}]*)\}\}/gm;
		var exp = [];

		// [].slice.apply(childNodes).forEach(function (node) {
		// 	if (isElement(node)) {
		// 		$this.compileElement(node);
		// 	} else if (isTextNode(node) && reg.test(node.textContent)) {
		// 		reg.lastIndex = 0;
		// 		while (res = reg.exec(node.textContent)) {
		// 			exp.push(res[1])
		// 		}
		// 		exp = exp.map(function (item) {
		// 			return trim(item);
		// 		});
		// 		$this.compileText(node, exp);
		// 	}

		// 	if (node.childNodes && node.childNodes.length > 0) {
		// 		$this.compile(node);
		// 	}
		// });

		[].slice.apply(childNodes).forEach(function (node) {
			var text = node.textContent;
			if (isElement(node)) {
				$this.compileElement(node);
			} else if (isTextNode(node) && reg.test(text)) {
				$this.compileText(node, trim(RegExp.$1));
			}
			if (node.childNodes && node.childNodes.length > 0) {
				$this.compile(node);
			}
		});
		
	},
	compileText: function (node, exp) {
		compileUtil.text(node, this.$vm, exp);
	},
	compileElement: function (node) {
		var $this = this;
		var attrs = node.attributes;
		[].slice.apply(attrs).forEach(function (attr) {
			var name = attr.name;
			var val = attr.value;
			if (isDirective(name)) {
				var dir = name.substring(2);
				//事件指令
				if (isEventDirective(dir)) {
					compileUtil.evnetHandler(node, $this.$vm, val, dir)
				} else {
					//普通指令
					compileUtil[dir] && compileUtil[dir](node, $this.$vm, val);
				}
				node.removeAttribute(name)
			}
		})
	}
}

var compileUtil = {
	bind: function (node, vm, exp, dir) {
		var updaterFn = updater[dir + 'Updater'];
		updaterFn && updaterFn(node, this._getVMVal(vm, exp));
		new Watcher(vm, exp, function (value, oldValue) {
			updaterFn && updaterFn(node, value, oldValue);
		})
	},
	text: function (node, vm, exp) {
		this.bind(node, vm, exp, 'text')
	},
	html: function (node, vm, exp) {
		this.bind(node, vm, exp, 'html')
	},
	model: function (node, vm, exp) {
		this.bind(node, vm, exp, 'model')
		var val = this._getVMVal(vm, exp)
		node.addEventListener('input', (e) => {
			var newValue = e.target.value;
			if (val === newValue) {
				return;
			}
			this._setVMVal(vm, exp, newValue);
			val = newValue;
		})
	},
	_getVMVal: function (vm, exp) {
		return parseObj(vm, exp) || '';
	},
	_setVMVal: function(vm, exp, value) {
		var exp = exp.split('.')
		exp.forEach(function (item, index) {
			if (index === exp.length -1) {
				vm[item] = value;
			} else {
				vm = vm[item];
			}
		})
	},
	evnetHandler: function(node, vm, exp, dir) {
		var eventType = dir.split(':')[1];
		var fn = vm.$options.methods && vm.$options.methods[exp];
		if (eventType && fn) {
			node.addEventListener(eventType, fn.bind(vm), false);
		}
	}
}

var updater = {
	textUpdater: function (node, value) {
		node.textContent = typeof value == 'undefined' ? '' : value;
	},
	htmlUpdater: function (node, value) {
		node.innerHTML = typeof value == 'undefined' ? '' : value;
	},
	modelUpdater: function(node, value, oldValue) {
		node.value = typeof value == 'undefined' ? '' : value;
	}
}

function isElement(node) {
	return node.nodeType === 1;
}
function isTextNode(node) {
	return node.nodeType === 3;
}
function isDirective(attrName) {
	return attrName.indexOf('v-') === 0;
}
function isEventDirective(dir) {
	return dir.indexOf('on') === 0;
}

function node2Fragment(el) {
	var fragment = document.createDocumentFragment();
	var child;
	while (el.firstChild) {
		fragment.appendChild(el.firstChild);
	}
	return fragment;
}




//去除首尾空格
function trim(str) {
	return str.replace(/(^\s*)|(\s*$)/g, "");
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
