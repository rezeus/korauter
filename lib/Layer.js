'use strict';

const { extractArgsForMethod, extractArgsForScope } = require('./utils');

const PRIV = Symbol('Layer.private');

const defaultOptions = {
  name: '', // that is the prefix for routes
  meta: {}, // that will be merged with the route's meta
};

class Layer {
  constructor(/** @type {import('./Router')} */ router, path, options = {}, parentScope = null) {
    let processedPath;
    let name;
    let meta;

    const tmpOptions = Object.assign({}, defaultOptions, options);
    if (parentScope === null) {
      processedPath = path;
      name = tmpOptions.name; // eslint-disable-line prefer-destructuring
      meta = tmpOptions.meta; // eslint-disable-line prefer-destructuring
    } else {
      processedPath = `${parentScope.path}${path}`;
      if (parentScope.name === '') {
        name = tmpOptions.name; // eslint-disable-line prefer-destructuring
      } else {
        name = (router.options.reverseScopeNaming)
          ? `${tmpOptions.name}${router.options.scopeSeparator}${parentScope.name}`
          : `${parentScope.name}${router.options.scopeSeparator}${tmpOptions.name}`;
      }
      meta = Object.assign({}, parentScope.meta, tmpOptions.meta);
    }

    this[PRIV] = {
      router,
      path: processedPath,
      name,
      meta,
    };
  }

  /**
   * Get path of the layer
   * @returns {string}
   */
  get path() {
    return this[PRIV].path;
  }

  /**
   * Get name of the layer
   * @returns {string}
   */
  get name() {
    return this[PRIV].name;
  }

  /**
   * Get meta of the layer
   * @returns {string}
   */
  get meta() {
    return this[PRIV].meta;
  }

  // #region HTTP Verb Methods

  head(nameOrPath, pathOrHandler, handlerOrMeta = undefined, meta = undefined) {
    const priv = this[PRIV];

    priv.router.register(
      'head',
      ...extractArgsForMethod(
        [nameOrPath, pathOrHandler, handlerOrMeta, meta].filter(e => e !== undefined)
      ),
      priv.name,
      priv.path,
      priv.meta
    );

    return this;
  }

  /**
   * Add handler function for HTTP GET verb on path
   *
   * @param {string} nameOrPath Route name or path
   * @param {function|string} pathOrHandler If the first argument is name then this is the **path**, otherwise **handler function**
   * @param {function|object} [handlerOrMeta] If the second argument is path this is the **handler function**, otherwise `undefined` or **meta**
   * @param {object} [meta] If the third argument is set then this may be the **meta**
   *
   * @example <caption>Simple - path and handler</caption>
   *  router.get('/users', usersController.index);
   *
   * @example <caption>Named - name, path and handler</caption>
   *  router.get('Users.Index', '/users', usersController.index);
   *
   * @example <caption>With meta - path, handler and meta</caption>
   *  router.get('/users', usersController.index, { foo: 'bar' });
   *
   * @example <caption>All Together - name, path, handler and meta</caption>
   *  router.get('Users.Index', '/users', usersController.index, { foo: 'bar' });
   *
   * @return {this} This layer instance
   */
  get(nameOrPath, pathOrHandler, handlerOrMeta = undefined, meta = undefined) {
    const priv = this[PRIV];

    priv.router.register(
      'get',
      ...extractArgsForMethod(
        [nameOrPath, pathOrHandler, handlerOrMeta, meta].filter(e => e !== undefined)
      ),
      priv.name,
      priv.path,
      priv.meta
    );

    return this;
  }

  /**
   * Add handler function for HTTP POST verb on path
   *
   * @param {string} nameOrPath Route name or path
   * @param {function|string} pathOrHandler If the first argument is name then this is the **path**, otherwise **handler function**
   * @param {function|object} [handlerOrMeta] If the second argument is path this is the **handler function**, otherwise `undefined` or **meta**
   * @param {object} [meta] If the third argument is set then this may be the **meta**
   *
   * @example <caption>Simple - path and handler</caption>
   *  router.post('/users', usersController.create);
   *
   * @example <caption>Named - name, path and handler</caption>
   *  router.post('Users.Create', '/users', usersController.create);
   *
   * @example <caption>With meta - path, handler and meta</caption>
   *  router.post('/users', usersController.create, { foo: 'bar' });
   *
   * @example <caption>All Together - name, path, handler and meta</caption>
   *  router.post('Users.Create', '/users', usersController.create, { foo: 'bar' });
   *
   * @return {this} This layer instance
   */
  post(nameOrPath, pathOrHandler, handlerOrMeta = undefined, meta = undefined) {
    const priv = this[PRIV];

    priv.router.register(
      'post',
      ...extractArgsForMethod(
        [nameOrPath, pathOrHandler, handlerOrMeta, meta].filter(e => e !== undefined)
      ),
      priv.name,
      priv.path,
      priv.meta
    );

    return this;
  }

  /**
   * Add handler function for HTTP PUT verb on path
   *
   * @param {string} nameOrPath Route name or path
   * @param {function|string} pathOrHandler If the first argument is name then this is the **path**, otherwise **handler function**
   * @param {function|object} [handlerOrMeta] If the second argument is path this is the **handler function**, otherwise `undefined` or **meta**
   * @param {object} [meta] If the third argument is set then this may be the **meta**
   *
   * @example <caption>Simple - path and handler</caption>
   *  router.put('/users/1', usersController.replace);
   *
   * @example <caption>Named - name, path and handler</caption>
   *  router.put('Users.Replace', '/users/1', usersController.replace);
   *
   * @example <caption>With meta - path, handler and meta</caption>
   *  router.put('/users/1', usersController.replace, { foo: 'bar' });
   *
   * @example <caption>All Together - name, path, handler and meta</caption>
   *  router.put('Users.Replace', '/users/1', usersController.replace, { foo: 'bar' });
   *
   * @return {this} This layer instance
   */
  put(nameOrPath, pathOrHandler, handlerOrMeta = undefined, meta = undefined) {
    const priv = this[PRIV];

    priv.router.register(
      'put',
      ...extractArgsForMethod(
        [nameOrPath, pathOrHandler, handlerOrMeta, meta].filter(e => e !== undefined)
      ),
      priv.name,
      priv.path,
      priv.meta
    );

    return this;
  }

  /**
   * Add handler function for HTTP DELETE verb on path
   *
   * @param {string} nameOrPath Route name or path
   * @param {function|string} pathOrHandler If the first argument is name then this is the **path**, otherwise **handler function**
   * @param {function|object} [handlerOrMeta] If the second argument is path this is the **handler function**, otherwise `undefined` or **meta**
   * @param {object} [meta] If the third argument is set then this may be the **meta** or `undefined`
   *
   * @example <caption>Simple - path and handler</caption>
   *  router.delete('/users/1', usersController.delete);
   *
   * @example <caption>Named - name, path and handler</caption>
   *  router.delete('Users.Delete', '/users/1', usersController.delete);
   *
   * @example <caption>With meta - path, handler and meta</caption>
   *  router.delete('/users/1', usersController.delete, { foo: 'bar' });
   *
   * @example <caption>All Together - name, path, handler and meta</caption>
   *  router.delete('Users.Delete', '/users/1', usersController.delete, { foo: 'bar' });
   *
   * @return {this} This layer instance
   */
  delete(nameOrPath, pathOrHandler, handlerOrMeta = undefined, meta = undefined) {
    const priv = this[PRIV];

    priv.router.register(
      'delete',
      ...extractArgsForMethod(
        [nameOrPath, pathOrHandler, handlerOrMeta, meta].filter(e => e !== undefined)
      ),
      priv.name,
      priv.path,
      priv.meta
    );

    return this;
  }

  /**
   * Add handler function for HTTP PATCH verb on path
   *
   * @param {string} nameOrPath Route name or path
   * @param {function|string} pathOrHandler If the first argument is name then this is the **path**, otherwise **handler function**
   * @param {function|object} [handlerOrMeta] If the second argument is path this is the **handler function**, otherwise `undefined` or **meta**
   * @param {object} [meta] If the third argument is set then this may be the **meta**
   *
   * @example <caption>Simple - path and handler</caption>
   *  router.patch('/users/1', usersController.update);
   *
   * @example <caption>Named - name, path and handler</caption>
   *  router.patch('Users.Update', '/users/1', usersController.update);
   *
   * @example <caption>With meta - path, handler and meta</caption>
   *  router.patch('/users/1', usersController.update, { foo: 'bar' });
   *
   * @example <caption>All Together - name, path, handler and meta</caption>
   *  router.patch('Users.Update', '/users/1', usersController.update, { foo: 'bar' });
   *
   * @return {this} This layer instance
   */
  patch(nameOrPath, pathOrHandler, handlerOrMeta = undefined, meta = undefined) {
    const priv = this[PRIV];

    priv.router.register(
      'patch',
      ...extractArgsForMethod(
        [nameOrPath, pathOrHandler, handlerOrMeta, meta].filter(e => e !== undefined)
      ),
      priv.name,
      priv.path,
      priv.meta
    );

    return this;
  }

  // TODO Consider OPTIONS, TRACE, CONNECT etc.

  // #endregion HTTP Verb Methods


  /**
   * Create a new scope with which you can nest route names and paths.
   * Also this scope's meta object (if set) is going to be merged
   * with the upper-scope's meta.
   *
   * @param {string} nameOrPath Scope name or path
   * @param {string|function} pathOrScopeFn If the first argument is name then this is the **path**, otherwise **scope function**
   * @param {function|object} [scopeFnOrMeta] If the second argument is path then this is the **scope function**, otherwise `undefined` or **meta**
   * @param {object} [meta] If the third argument is set then this may be the **meta** or `undefined`
   *
   * @example <caption>Simple - path and scope function</caption>
   *  router.scope('/posts', (posts) => {
   *    // this is the scope function
   *  });
   *
   * @example <caption>Named - name, path and scope function</caption>
   *  router.scope('Posts', '/posts', (posts) => {
   *    // this is the scope function
   *  });
   *
   * @example <caption>With meta - name, path and scope function</caption>
   *  router.scope('/posts', (posts) => {
   *    // this is the scope function
   *  }, {
   *    // meta object
   *    // properties defined here are going to be
   *    // available for the routes defined in
   *    // this scope.
   *  });
   *
   * @example <caption>All Together - name, path, scope function and meta</caption>
   *  router.scope('Posts', '/posts', (posts) => {
   *    // this is the scope function
   *  }, {
   *    // meta object
   *  });
   *
   * @return {this} This layer instance
   */
  scope(nameOrPath, pathOrScopeFn, scopeFnOrMeta = undefined, meta = undefined) {
    const {
      namePrefix,
      pathPrefix,
      scopeFn,
      meta: extractedMeta,
    } = extractArgsForScope(
      [nameOrPath, pathOrScopeFn, scopeFnOrMeta, meta].filter(e => e !== undefined)
    );

    const layer = new Layer(this[PRIV].router, pathPrefix, {
      name: namePrefix,
      meta: extractedMeta,
    }, this);

    scopeFn(layer);
  }
}

module.exports = Layer;
