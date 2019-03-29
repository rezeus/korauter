'use strict';

const { Trie } = require('route-trie');

const Layer = require('./Layer');

const PRIV = Symbol('Router.private');

/**
 * @typedef {object} Options
 * @property {string} [pathPrefix] Default is empty string (i.e. `''`)
 * @property {string} [scopeSeparator] Default is empty string (i.e. `''`)
 * @property {boolean} [reverseScopeNaming] Default is `false`
 */

/**
 * @callback ScopeFunction
 * @param {Layer} _ New layer for the scope
 */

/** @type {Options} */
const defaultOptions = {
  pathPrefix: '',
  scopeSeparator: '',
  reverseScopeNaming: false,
};

class Router {
  /** @param {Options} options */
  constructor(options) {
    const mergedOpts = Object.assign({}, defaultOptions, options);

    Object.defineProperty(this, 'options', { value: Object.freeze(mergedOpts) });

    this[PRIV] = {
      trie: new Trie(),
      namedRoutePaths: {}, // name -> path

      defaultLayer: new Layer(this, mergedOpts.pathPrefix, {}),
    };
  }

  // #region HTTP Verb Methods

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
   * @return {Layer} Router's default layer
   */
  get(nameOrPath, pathOrHandler, handlerOrMeta = undefined, meta = undefined) {
    const args = [nameOrPath, pathOrHandler];
    if (handlerOrMeta) {
      args.push(handlerOrMeta);
    }
    if (meta) {
      args.push(meta);
    }

    const { defaultLayer } = this[PRIV];
    defaultLayer.get.call(defaultLayer, ...args);

    return defaultLayer;
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
   * @return {Layer} Router's default layer
   */
  post(nameOrPath, pathOrHandler, handlerOrMeta = undefined, meta = undefined) {
    const args = [nameOrPath, pathOrHandler];
    if (handlerOrMeta) {
      args.push(handlerOrMeta);
    }
    if (meta) {
      args.push(meta);
    }

    const { defaultLayer } = this[PRIV];
    defaultLayer.post.call(defaultLayer, ...args);

    return defaultLayer;
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
   * @return {Layer} Router's default layer
   */
  put(nameOrPath, pathOrHandler, handlerOrMeta = undefined, meta = undefined) {
    const args = [nameOrPath, pathOrHandler];
    if (handlerOrMeta) {
      args.push(handlerOrMeta);
    }
    if (meta) {
      args.push(meta);
    }

    const { defaultLayer } = this[PRIV];
    defaultLayer.put.call(defaultLayer, ...args);

    return defaultLayer;
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
   * @return {Layer} Router's default layer
   */
  patch(nameOrPath, pathOrHandler, handlerOrMeta = undefined, meta = undefined) {
    const args = [nameOrPath, pathOrHandler];
    if (handlerOrMeta) {
      args.push(handlerOrMeta);
    }
    if (meta) {
      args.push(meta);
    }

    const { defaultLayer } = this[PRIV];
    defaultLayer.patch.call(defaultLayer, ...args);

    return defaultLayer;
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
   * @return {Layer} Router's default layer
   */
  delete(nameOrPath, pathOrHandler, handlerOrMeta = undefined, meta = undefined) {
    const args = [nameOrPath, pathOrHandler];
    if (handlerOrMeta) {
      args.push(handlerOrMeta);
    }
    if (meta) {
      args.push(meta);
    }

    const { defaultLayer } = this[PRIV];
    defaultLayer.delete.call(defaultLayer, ...args);

    return defaultLayer;
  }

  // TODO Consider HEAD, OPTIONS, TRACE, CONNECT etc.

  // #endregion HTTP Verb Methods


  /**
   * Create a new scope with which you can nest route names and paths.
   * Also this scope's meta object (if set) is going to be merged
   * with the upper-scope's meta.
   *
   * @param {string} nameOrPath Scope name or path
   * @param {string|ScopeFunction} pathOrScopeFn If the first argument is name then this is the **path**, otherwise **scope function**
   * @param {ScopeFunction} [scopeFnOrMeta] If the second argument is path then this is the **scope function**, otherwise `undefined` or **meta**
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
   * @return {Layer} Router's default layer
   */
  scope(nameOrPath, pathOrScopeFn, scopeFnOrMeta = undefined, meta = undefined) {
    const args = [nameOrPath, pathOrScopeFn];
    if (scopeFnOrMeta) {
      args.push(scopeFnOrMeta);
    }
    if (meta) {
      args.push(meta);
    }

    this[PRIV].defaultLayer.scope.call(this[PRIV].defaultLayer, ...args);

    return this;
  }


  register(methods, name, path, handler, meta, namePrefix = '', pathPrefix = '', defaultMeta = {}) {
    if (Array.isArray(methods)) {
      if (
        ((typeof name === 'object' && !Array.isArray(name)) || name === undefined)
        && path === undefined && handler === undefined
      ) {
        // Vue Router like object
        this.registerVueStyle(methods, '', '', name); // eslint-disable-line no-use-before-define
      } else {
        methods.forEach(method => this.register(method, name, path, handler));
      }

      return this;
    }


    // `methods` is string from this point on
    /** @type {string} */
    const method = methods.toLowerCase();
    const normalizedPath = path.replace(/\/$/, ''); // remove trailing slash ('/')
    const normalizedPathPrefix = pathPrefix.replace(/\/$/, ''); // remove trailing slash ('/')
    let prefixedPath = `${normalizedPathPrefix}${normalizedPath}`;
    if (prefixedPath === '') {
      prefixedPath = '/';
    }

    if (name !== '') {
      let prefixedName;
      if (namePrefix === '') {
        prefixedName = name;
      } else {
        // eslint-disable-next-line no-lonely-if
        if (this.options.reverseScopeNaming) {
          prefixedName = `${name}${this.options.scopeSeparator}${namePrefix}`;
        } else {
          prefixedName = `${namePrefix}${this.options.scopeSeparator}${name}`;
        }
      }

      this[PRIV].namedRoutePaths[prefixedName] = prefixedPath;
    }

    this[PRIV].trie
      .define(prefixedPath)
      .handle(
        method,
        [
          handler,
          Object.assign({}, defaultMeta, meta),
        ]
      );

    return this;
  }

  registerVueStyle(routes, namePrefix = '', pathPrefix = '', defaultMeta = {}) {
    // if no handler and children omit route (with warning)
    // if no method but has handler, treat it as GET
    // if child path starts with / treat as a root path (as in Vue Router)

    let normalizedPath = '';
    /* eslint-disable */
    for (let i = 0, route = routes[i]; i < routes.length; i += 1, route = routes[i]) {
      // console.log('\nprocessing...', { route, namePrefix, pathPrefix, defaultMeta });

      if (!route.handler) {
        // has NO handler
        if (!route.children) {
          // has NO child
          // FIXME The line below is going to stay there, use 'logger' or smth similar
          console.log('Warning: Omitting the route due to it has no handler nor a child.', route);
          continue;
        }

        // has child(ren)
        // console.log('route can not be navigated but has child(ren)');

        if (route.path[0] === '/') {
          normalizedPath = route.path;
        } else {
          normalizedPath = `/${route.path}`;
        }
      } else {
        // has handler
        if (route.path[0] === '/') {
          normalizedPath = route.path;

          // register as root path
          this.register(
            !route.method ? 'get' : route.method,
            !route.name ? '' : route.name,
            normalizedPath,
            route.handler,
            route.meta,
            '',
            '',
            defaultMeta,
          );
        } else {
          normalizedPath = `/${route.path}`;

          this.register(
            !route.method ? 'get' : route.method,
            !route.name ? '' : route.name,
            normalizedPath,
            route.handler,
            route.meta,
            namePrefix,
            pathPrefix,
            defaultMeta,
          );
        }
      }

      // Process children by calling this very function (recursively)
      if (route.children) {
        this.registerVueStyle(
          route.children,
          !route.name ? '' : route.name,
          `${pathPrefix}${normalizedPath}`,
          Object.assign({}, defaultMeta, route.meta)
        );
      }
    }
    /* eslint-enable */
  }


  resolve() {
    return resolve.bind(this);
  }

  routes() {
    return handle.bind(this);
  }

  handle() {
    return handle.bind(this);
  }

  hasRoute(nameOrPath) {
    if (nameOrPath[0] === '/') {
      // search by path

      /** @type {Trie} */
      const t = this[PRIV].trie;
      const matched = t.match(nameOrPath);

      return (matched.node !== null);
    } else {
      // search by name

      const nps = this[PRIV].namedRoutePaths;
      /** @type {Array<string>} */
      const names = Object.keys(nps);

      return names.includes(nameOrPath);
    }
  }

  /**
   * Calculate route name for route considering `scopeSeparator`
   * and `reverseScopeNaming` options.
   *
   * @param {string} routeName Route name
   * @param {Array<string>} scopeNames Outer-most to inner-most scope names of the route
   */
  calculateName(routeName = '', scopeNames = []) {
    if (routeName === '') {
      return '';
    }

    if (scopeNames.length === 0) {
      return routeName;
    }

    const scopeSeparator = (this.options.scopeSeparator || '');
    const processedScopeNames = (this.options.reverseScopeNaming && this.options.reverseScopeNaming === true)
      ? scopeNames.reverse()
      : scopeNames;

    return `${processedScopeNames.join(scopeSeparator)}${scopeSeparator}${routeName}`;
  }
}


function find(method, path) {
  // NOTE `this` is the Router instance

  const {
    // fpr,
    node,
    params,
    // tsr,
  } = this[PRIV].trie.match(path);

  if (!node) {
    // NOT_FOUND
    return { handler: null, params: [], meta: {} };
  }

  const handlerAndMeta = node.getHandler(method);

  if (!handlerAndMeta) {
    // NOT_FOUND
    return { handler: null, params: [], meta: {} };
  }

  return {
    handler: handlerAndMeta[0],
    params,
    meta: handlerAndMeta[1],
  };
}

// #region Middlewares

/**
 * Finds the corresponding route record via URL
 * and stores it to the context.
 *
 * @param {import('koa').Context} ctx Koa context
 * @param {Function} next Next middleware function
 */
async function resolve(ctx, next) {
  // NOTE `this` is the Router instance

  const { handler, params, meta } = find.call(this, ctx.method.toLocaleLowerCase(), ctx.path);

  if (!handler) {
    ctx.throw(404); // TODO If this works also change on `handle` [SMSTFDWY]
  }

  ctx.route = { handler, params, meta };

  await next();
}

/**
 * Resolves the URL if it wasn't so far and
 * then executes the handler function.
 *
 * @param {import('koa').Context} ctx Koa context
 * @param {Function} next Next middleware function
 */
async function handle(ctx, next) {
  // NOTE `this` is the Router instance

  const { handler, params } = (Reflect.has(ctx, 'route'))
    ? Reflect.get(ctx, 'route') // `resolve` middleware was used
    : find.call(this, ctx.method.toLocaleLowerCase(), ctx.path);

  if (!handler) {
    // TODO If method not allowed response with 405
    await next(); // FIXME continue or `CTX.THROW(404)`? [SMSTFDWY]
  } else {
    ctx.params = Object.assign({}, params);
    ctx.path = ctx.path.substring(this.options.pathPrefix.length);

    // TODO Find out what the `next` does here?
    if (handler.constructor.name === 'AsyncFunction') {
      await handler(ctx/* , next */);
    } else {
      handler(ctx/* , next */);
    }
    await next();
  }
}

// #endregion Middlewares

module.exports = Router;
