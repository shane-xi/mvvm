function Compile(el, vm) {
    this.$vm = vm;
    this.$el = isElement(el) ? el : document.querySelector(el);

   if(this.$el) {
        this.$fragment = node2Fragment(this.$el);
        this.init();
        this.$el.appendChild(this.$fragment);
   }
}

Compile.prototype = {
    constructor: Compile,
    init: function() {
        this.compile(this.$fragment);
    },
    compile: function(node) {
        var childNodes = node.childNodes;
        var $this = this;
        var reg = /\{\{([^}]*)\}\}/gm;
        var exp = [];

        [].slice.apply(childNodes).forEach(function(node) {
            if (isElement(node)) {
                $this.compileElement(node);
            } else if (isTextNode(node) && reg.test(node.textContent)) {
                reg.lastIndex = 0;
                while (res = reg.exec(node.textContent) ) {
                    exp.push(res[1])
                }
                exp = exp.map(function(item) {
                    return trim(item);
                });
                $this.compileText(node, exp);
            }

            if (node.childNodes && node.childNodes.length > 0) {
                $this.compile(childNodes);
            }
        });

    },
    compileText: function(node, exp) {
        compileUtil.text(node, this.$vm, exp);
    },
    compileElement: function (params) {
        
    }
}

var compileUtil = {
    bind: function (node, vm, exp, dir) {
        var updaterFn = updater[ dir + 'Updater'];
        updaterFn && updaterFn(node, this._getVMVal(vm, exp));
    },
    text: function (node, vm, exp) {
        this.bind(node, vm, exp, 'text')
    },


    _getVMVal: function(vm, exp) {
        var values = exp.map(function(item) {
            return parseObj(vm, item) || '';
        })
        return values;
    }
}

var updater = {
    textUpdater: function(node, value) {
        var count = 0;
        node.textContent = node.textContent.replace(/\{\{[^}]*\}\}/gm, function(){
            return value[count++];
        });
    }
}

function isElement(node) {
    return node.nodeType === 1;
}
function isTextNode(node) {
    return node.nodeType === 3;
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
function trim (str) {
    return str.replace(/(^\s*)|(\s*$)/g, "");
}
//当对象Key也一个对象时
function parseObj (obj, str) {
    var val = obj;
    str.replace('[', '.').replace(']', '').split('.')
    .forEach(function (key) {
        val = val[key]
    });
    return val
}
