'use strict';

const pathToRegexp = require('path-to-regexp');
const qs = require('qs');

const Layer = require('./Layer');
const TreeNode = require('./tree');

// TODO If registering a route with the same (existing) path (URL) log warning

const defaultOptions = {
  pathPrefix: '',
  scopeSeparator: '',
  reverseScopeNaming: false,
};


function register(methods, name, /** @type {string} */ path, handler, meta, namePrefix = '', pathPrefix = '', defaultMeta = {}) {
  if (Array.isArray(methods)) {
    if (
      ((typeof name === 'object' && !Array.isArray(name)) || name === undefined)
      && path === undefined && handler === undefined
    ) {
      // Vue Router like object
      registerVueStyle.call(this, methods, '', '', name); // eslint-disable-line no-use-before-define
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

  if (!this.trees[method]) {
    this.trees[method] = new TreeNode();
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

    this.namedRoutePaths[prefixedName] = prefixedPath;
  }

  this.trees[method].addRoute(prefixedPath, {
    handler,
    meta: Object.assign({}, defaultMeta, meta),
  });

  return this;
}

// TODO Refactor this after tests
/** @param {Array<RouteRecord>} routes */
function registerVueStyle(routes, namePrefix = '', pathPrefix = '', defaultMeta = {}) {
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
      registerVueStyle.call(
        this,
        route.children,
        !route.name ? '' : route.name,
        `${pathPrefix}${normalizedPath}`,
        Object.assign({}, defaultMeta, route.meta)
      );
    }
  }
  /* eslint-enable */
}

function find(routerInstance, method, path) {
  let normalizedPath = path.replace(/\/$/, ''); // remove trailing slash ('/')
  if (normalizedPath === '') {
    normalizedPath = '/';
  }

  const tree = routerInstance.trees[method];

  if (tree) {
    return tree.search(normalizedPath);
  }

  // NOT_FOUND
  return { handler: null, params: [], meta: {} };
}

/**
 * Finds the corresponding route record via URL
 * and stores it to the context.
 *
 * @param {import('koa').Context} ctx Koa context
 * @param {Function} next Next middleware function
 */
async function resolve(ctx, next) {
  const { handler, params, meta } = find(this, ctx.method.toLocaleLowerCase(), ctx.path);

  if (!handler) {
    ctx.throw(404); // TODO If this works also change on `handle`
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
  // TODO Is `Router.handle` really async?
  const { handler, params } = (Reflect.has(ctx, 'route'))
    ? Reflect.get(ctx, 'route') // `resolve` middleware was used
    : find(this, ctx.method.toLocaleLowerCase(), ctx.path);

  if (!handler) {
    // TODO https://github.com/steambap/koa-tree-router/blob/master/router.js#L77-L93
    next(); // FIXME continue or `CTX.THROW(404)`?
  } else {
    ctx.params = {};
    // FIXME Do the below w/o `.forEach()`
    params.forEach(({ key, value }) => { ctx.params[key] = value; });
    ctx.path = ctx.path.substring(this.options.pathPrefix.length);

    // TODO Find out what the `next` does here?
    if (handler.constructor.name === 'AsyncFunction') {
      await handler(ctx, next);
    } else {
      handler(ctx, next);
    }
  }
}


function Router(options) {
  // Check if called with `new`
  if (!(this instanceof Router)) {
    throw new Error('Use \'new\' keyword to instantiate a new router.');
  }

  this.options = Object.assign({}, defaultOptions, options);
  this.trees = {};
  this.namedRoutePaths = {}; // name -> path

  this.defaultLayer = new Layer(this, this.options.pathPrefix, {});
}


Router.prototype.register = register;

function url(name, params, opts) {
  const path = this.namedRoutePaths[name];

  if (!path) {
    throw new Error(`Named route (${name}) does not exist.`);
  }

  return Router.url(path, params, opts);
}
Router.prototype.url = url;

Router.prototype.resolve = function resolveMiddleware() { return resolve.bind(this); };
Router.prototype.routes = function routesMiddleware() { return handle.bind(this); };
Router.prototype.handle = function handleMiddleware() { return handle.bind(this); };

// Proxy to the `defaultLayer`
/* eslint-disable max-len, func-names */
//
// HTTP method shorthand methods
Router.prototype.get = function (...args) { this.defaultLayer.get.call(this.defaultLayer, ...args); return this; };
Router.prototype.post = function (...args) { this.defaultLayer.post.call(this.defaultLayer, ...args); return this; };
Router.prototype.put = function (...args) { this.defaultLayer.put.call(this.defaultLayer, ...args); return this; };
Router.prototype.del = function (...args) { this.defaultLayer.del.call(this.defaultLayer, ...args); return this; };
Router.prototype.patch = function (...args) { this.defaultLayer.patch.call(this.defaultLayer, ...args); return this; };
// TODO Consider 'options', 'trace', 'connect'

Router.prototype.scope = function (...args) { this.defaultLayer.scope.call(this.defaultLayer, ...args); return this; };
/* eslint-enable max-len, func-names */


const defaultOptsForQs = {
  arrayFormat: 'brackets',
  //
};

function createUrl(path, params = undefined, opts = {}) {
  if (!params && !opts.query) {
    return path;
  }

  let result = path;

  if (typeof params === 'object' && Object.keys(params).length > 0) {
    // TODO Maybe using a LRU cache for the `toPath` here is a good idea
    const toPath = pathToRegexp.compile(path);
    result = toPath(params);
  }

  if (typeof opts.query === 'object' && Object.keys(opts.query).length > 0) {
    const { query, ...restOpts } = opts;
    const qsOpts = Object.assign({}, defaultOptsForQs, restOpts);
    result = `${result}?${qs.stringify(query, qsOpts)}`;
  }

  return result;
}
Router.url = createUrl;


module.exports = Router;
