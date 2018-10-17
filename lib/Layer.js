'use strict';

const { extractArgsForMethod, extractArgsForScope } = require('./utils');

const defaultOptions = {
  name: '', // that is the prefix for routes
  meta: {}, // that will be merged with the route's meta
};

function Layer(/** @type {import('./Router')} */ router, path, options = {}, parentScope = null) {
  this.router = router;

  const tmpOptions = Object.assign({}, defaultOptions, options);
  if (parentScope === null) {
    this.path = path;
    this.name = tmpOptions.name;
    this.meta = tmpOptions.meta;
  } else {
    this.path = `${parentScope.path}${path}`;

    if (parentScope.name === '') {
      this.name = tmpOptions.name;
    } else {
      // eslint-disable-next-line no-lonely-if
      if (this.router.options.reverseScopeNaming) {
        this.name = `${tmpOptions.name}${this.router.options.scopeSeparator}${parentScope.name}`;
      } else {
        this.name = `${parentScope.name}${this.router.options.scopeSeparator}${tmpOptions.name}`;
      }
    }
    this.meta = Object.assign({}, parentScope.meta, tmpOptions.meta);
  }
}

Layer.prototype.head = function head(...args) {
  this.router.register('head', ...extractArgsForMethod(args), this.name, this.path, this.meta);
  return this;
};

Layer.prototype.get = function get(...args) {
  this.router.register('get', ...extractArgsForMethod(args), this.name, this.path, this.meta);
  return this;
};

Layer.prototype.post = function post(...args) {
  this.router.register('post', ...extractArgsForMethod(args), this.name, this.path, this.meta);
  return this;
};

Layer.prototype.put = function put(...args) {
  this.router.register('put', ...extractArgsForMethod(args), this.name, this.path, this.meta);
  return this;
};

Layer.prototype.del = function del(...args) {
  this.router.register('delete', ...extractArgsForMethod(args), this.name, this.path, this.meta);
  return this;
};

Layer.prototype.patch = function patch(...args) {
  this.router.register('patch', ...extractArgsForMethod(args), this.name, this.path, this.meta);
  return this;
};

Layer.prototype.scope = function scope(...args) {
  const {
    namePrefix,
    pathPrefix,
    scopeFn,
    meta,
  } = extractArgsForScope(args);

  const layer = new Layer(this.router, pathPrefix, {
    name: namePrefix,
    meta,
  }, this);

  scopeFn(layer);
};

//

module.exports = Layer;
