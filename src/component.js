var event = require("./event");

function Component(props) {
  this.props = this._buildProps(props);
  this.state = {};
  this.mounted = false;
  event.on(this, "mount", function(root) {
    this.mounted = true;
    this.root = root;
    event.emit(this, "upstream:update");
  });
  event.on(this, "unmount", function() {
    this.mounted = false;
    this.root = null;
  });
  if(this.mixins) {
    this.mixins.forEach(function(mixin) {
      mixin.init(this);
    }, this);
  }
  this.init();
}

Component.createClass = function(proto) {
  var componentClass = function() {
    return Component.apply(this, arguments);
  };
  componentClass.prototype = Object.create(Component.prototype);
  Object.defineProperty(componentClass.prototype, "constructor", {
    configurable: true,
    enumerable: false,
    writable: true,
    value: componentClass
  });
  Object.assign(componentClass.prototype, proto);
  return componentClass;
};

Component.mixins = null;

Component.propTypes = {};

Component.dom = {};

Component.defaultProps = {};

["mixins", "propTypes", "dom", "defaultProps"].forEach(function(name) {
  Object.defineProperty(Component.prototype, name, {
    configurable: true,
    enumerable: true,
    get: function() {
      return this.constructor[name];
    },
    set: function(value) {
      this.constructor[name] = value;
    }
  });
});

Component.prototype.init = function() {};

Component.prototype.needUpdate = function(nextProps, nextState) {
  return true;
};

Component.prototype._buildProps = function(props) {
  return Object.assign({}, this.defaultProps, props);
};

Component.prototype._update = function(props, state) {
  if(props !== this.props) {
    event.emit(this, "receive-props", props);
  }
  var needUpdate = this.mounted && this.needUpdate(props, state);
  this.props = props;
  this.state = state;
  if(needUpdate) {
    event.emit(this, "upstream:update");
  }
};

Component.prototype.forceUpdate = function() {
  if(this.mounted) {
    event.emit(this, "upstream:update");
  }
};

Component.prototype.setProps = function(props) {
  this._update(Object.assign({}, this.props, props), this.state);
};

Component.prototype.replaceProps = function(props) {
  this._update(this._buildProps(props), this.state);
};

Component.prototype.setState = function(state) {
  this._update(this.props, Object.assign({}, this.state, state));
};

Component.prototype.replaceState = function(state) {
  this._update(this.props, state);
};

Component.prototype.emit = function(type, detail) {
  event.emit(this, "upstream:emit-event", type, detail);
};

Component.prototype.render = function() {
  return null;
};

module.exports = Component;
