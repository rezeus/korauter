# korauter

Yet another Koa router, inspired by Vue Router.

## Table of Contents

* [Features](#features)
* [Installation](#installation)
* [Usage](#usage)
  * [Classic Style](#classic-style)
  * [Vue Router Style](#vue-router-style)
* [API](#api)
  * [Router.url(path, params[, opts])](#routerurlpath-params-opts)
  * [Router([options])](#routeroptions)
  * [router\[get|post|put|delete|patch\]\(args)](#routergetpostputdeletepatchargs)
  * [router.scope(args)](#routerscopeargs)
  * [router.register(routes)](#routerregisterroutes)
  * [router.resolve()](#routerresolve)
  * [router.handle()](#routerhandle)
  * [router.routes()](#routerroutes)
* [Roadmap](#roadmap)
* [Acknowledgements](#acknowledgements)
* [Comparison with Other Packages](#comparison-with-other-packages)
  * [koa-router](#koa-router)
* [License](#license)

## Features

* Express-style routing; e.g. `router.get`, `router.post`
* TODO Named routes for URL generation with named URL parameters
* Router scopes (in Classic Style)
* Nested router records (in Vue Router Style)
* Meta data for routes

## Installation

```sh
npm install @rezeus/korauter --save
```

## Usage

### Classic Style

No different than any other Koa router (for example [koa-router](https://github.com/alexmingoia/koa-router) or [koa-tree-router](https://github.com/steambap/koa-tree-router)) for a simple example;

```javascript
const Koa = require('koa');
const Router = require('@rezeus/korauter');

const app = new Koa();
const router = new Router();

router.get('/', (ctx) => {
  ctx.body = 'Hello World!';
});

app.use(router.routes());

app.listen(8080);
```

The snippet below is more complex than the one above, to show all the abilities;

```javascript
const Koa = require('koa');
const Router = require('@rezeus/korauter');

const app = new Koa();
const router = new Router();

// Same as above
//
router.get('/', (ctx) => {
  ctx.body = 'Hello World!';
});

// Named route
//
router.get('About', '/about', (ctx) => {
  ctx.body = 'Sample app for korauter v1.0.0';
});

router.url('About'); // will result in '/about'

// Router scope
//
router.scope('/files', (files) => {
  // `files` here is a 'layer', you can call any other HTTP methods-
  // related router method (e.g. `.get()`, `.post()`). Like so;
  files.get('ViewFile', '/:filename', (ctx) => {
    const filename = ctx.params.filename;

    // read the file (to `content`)
    ctx.body = content;
  });
  // Actually router's HTTP methods-related methods (e.g. `.get()`,
  // `.post()`) comes from the 'default layer'.
  // Layer also provides another method (`.scope()`) as you can see above.
});

// Named router scopes and routes
//
router.scope('Users', '/users', (users) => {
  users.get('Index', '/', (ctx) => {
    // ...
  });

  users.get('View', '/:username', (ctx) => {
    // ...
  });
});

router.url('UsersView', { username: 'john-doe' }); // will result in '/users/john-doe'

// Nested router scopes
//
// Let's assume here we have 'PostsController'
// and 'CommentsController' files that
// provides methods used below.
router.scope('/posts', (posts) => {
  posts.get('AllPosts', '/', PostsController.index);

  posts.scope('Post', '/:postId', (post) => {
    // get the 'postId' via `ctx.params`
    post.get('ViewPost', '/', PostsController.view);

    post.scope('Comments', '/comments', (comments) => {
      comments.get('Index', '/', CommentsController.index);
      // also get the 'commentId' via `ctx.params`
      comments.get('View', '/:commentId', CommentsController.view);
    });
  });
});

// Meta data
// (also how to add nested route outside of a scope,
// nothing special just add it as a normal route;
// '/:username' nested under '/users')
//
router.del('/users/:username', UsersController.remove, {
  // this is the meta data object for this route
  requiresAuth: true,
});

router.del('DeletePost', '/posts/:postId', PostsController.remove, {
  // for this route it's the 4th argument
  // (meta data comes after route middleware)
  requiresAuth: true,
});

/**
 * So far we have the following routes,
 * -    GET /
 * -    GET /about
 * -    GET /files/:filename
 * -    GET /users
 * -    GET /users/:username
 * - DELETE /users/:username
 * -    GET /posts
 * -    GET /posts/:postId
 * - DELETE /posts/:postId
 * -    GET /posts/:postId/comments
 * -    GET /posts/:postId/comments/:commentId
 *
 * we could be more organized, but for the sake of
 * the example the routes scattered everywhere.
 */

// Middlewares `.resolve()` and `.handle()`
//
// `.resolve()` middleware add `route` record
// to the `ctx` if a match has been found.
app.use(router.resolve());
app.use((ctx, next) => {
  // Simple authorization middleware

  // The catch here is that we can examine the
  // route's meta data here to take or not
  // take action to do certain checks.
  if (ctx.route.meta.requiresAuth) {
    ctx.assert(ctx.header.authorization, 403);
    // TODO Further verify the header value
  }

  await next();
});
// Let the router handle the rest, as it would
// with `.routes()` middleware. In fact this
// middleware is alias for `.routes()` to
// avoid confusion.
app.use(router.handle());

// Start the app
//
app.listen(8080);
```

### Vue Router Style

If you have ever used Vue Router before the syntax below will look familiar;

```javascript
const Koa = require('koa');
const Router = require('@rezeus/korauter');

const app = new Koa();
const router = new Router();

const routes = [
  {
    path: '/',
    handler: (ctx) => {
      ctx.body = 'Hello World!';
    },
  },
];

router.register(routes);

app.use(router.routes());

app.listen(8080);
```

The `component` key (of Vue Router route record) was substituted with `handler` key in Korauter. It's merely a function that acts as Koa middleware - don't be surprised, this function is identical to the one above. Actually the code snippets in here (Usage - Vue Router Style) corresponds to the Classic Usage section's code snippets (in case you haven't figured it out yet).

Other than this key substitution there is one key, named as `method`, has been added. It explicitly tells the Korauter the HTTP method for the route record in question. Although you can see it's usage below, here's a simplest usage example;

```javascript
const routes = [
  {
    method: 'get',
    // Rest is same
    path: '/',
    handler: (ctx) => {
      ctx.body = 'Hello World!';
    },
  },
];
```

The reason why we haven't add `method: 'get'` in the first example is because if `method` key was omitted it's going to be defaulted as `'get'`.

The snippet below is more complex than the one above, to show all the abilities;

```javascript
const Koa = require('koa');
const Router = require('@rezeus/korauter');

const app = new Koa();
const router = new Router();

const routes = [
  // Same as above
  //
  {
    path: '/',
    handler: (ctx) => {
      ctx.body = 'Hello World!';
    },
  },

  // Named route
  //
  {
    path: '/about',
    handler: (ctx) => {
      ctx.body = 'Sample app for korauter v1.0.0';
    },
    name: 'About',
  },

  // After registering the `routes`, `router.url('About');` will result in '/about'

  // Router scope (nested route records)
  //
  {
    path: '/files',
    // Since there's no `handler` defined here, this route record
    // can not be navigated, but it's children are navigable.
    children: [ // nest child route records as an array on `children` key
      {
        path: ':filename', // Notice that there is no leading slash (as in Vue Router)
        handler: (ctx) => {
          const filename = ctx.params.filename;

          // read the file (to `content`)
          ctx.body = content;
        },
      },
    ],
  },

  // Named router scopes and routes
  //
  {
    path: '/users',
    name: 'Users',
    children: [
      {
        path: '', // Notice the empty `path` - it has the same effect with the alternative below
        handler: (ctx) => {
          // 'UsersIndex' codes
        },
        name: 'Index',
      },
      {
        path: ':username',
        handler: (ctx) => {
          // 'UsersView' codes
        },
        name: 'View',
      },
    ],
  },

  {
    path: '/users-alternative',
    handler: (ctx) => {
      // 'Users' codes (but not 'UsersIndex' anymore)

      // Defining the `handler` here left us with 'Users' and 'UsersView' named routes
      // in contrast to 'UsersIndex' and 'UsersView' named routes.
    },
    name: 'Users',
    children: [
      {
        path: ':username',
        handler: (ctx) => {
          // 'UsersView' codes
        },
        name: 'View',
      },
    ],
  },

  // After registering the `routes`, `router.url('UsersView', { username: 'john-doe' });` will result in '/users/john-doe'

  // Nested router scopes
  // (You can nest as much as you need)
  //
  // Let's assume here we have 'PostsController'
  // and 'CommentsController' files that
  // provides methods used below.
  {
    path: '/posts',
    children: [
      {
        path: '',
        handler: PostsController.index,
        name: 'AllPosts',
      },
      {
        path: ':postId',
        children: [
          {
            path: '',
            // get the 'postId' via `ctx.params`
            handler: PostsController.view,
            name: 'ViewPost',
          },
          {
            path: 'comments',
            name: 'Comments',
            children: [
              {
                path: '',
                handler: CommentsController.index,
                name: 'Index',
              },
              {
                path: ':commentId',
                // also get the 'commentId' via `ctx.params`
                handler: CommentsController.view,
                name: 'View',
              },
            ],
          },
        ],
      },
    ],
  },

  // Meta data
  // (also how to add nested route outside of a scope,
  // nothing special just add it as a normal route;
  // '/:username' nested under '/users')
  //
  {
    method: 'delete', // Notice 'delete' (full-word) was used, not 'del'
    path: '/users/:username',
    handler: UsersController.remove,
    meta: {
      // this is the meta data object for this route
      requiresAuth: true,
    },
  },
  {
    method: 'delete',
    path: '/posts/:postId',
    handler: PostsController.remove,
    meta: {
      // for this route it's the 4th argument
      // (meta data comes after route middleware)
      requiresAuth: true,
    },
    name: 'DeletePost',
  },
];

router.register(routes); // This line registers the `routes` to the Korauter instance

// The rest is same as the complex usage snippet on the Classic Style

// Middlewares `.resolve()` and `.handle()`
//
// `.resolve()` middleware add `route` record
// to the `ctx` if a match has been found.
app.use(router.resolve());
app.use((ctx, next) => {
  // Simple authorization middleware

  // The catch here is that we can examine the
  // route's meta data here to take or not
  // take action to do certain checks.
  if (ctx.route.meta.requiresAuth) {
    ctx.assert(ctx.header.authorization, 403);
    // TODO Further verify the header value
  }

  await next();
});
// Let the router handle the rest, as it would
// with `.routes()` middleware. In fact this
// middleware is alias for `.routes()` to
// avoid confusion.
app.use(router.handle());

// Start the app
//
app.listen(8080);
```

## API

### Router.url(path, params[, opts])

A static method to create URL with path and (optionally) query parameters. `path` is the string representation of the URL pattern, `params` and `opts` are object. `opts.query` is the query parameters key-value object. Other keys for the `opts` object is going to be handed to  `ljharb/qs` package **after** merging with defaults. Please see available options at [qs documentation](https://github.com/ljharb/qs#stringifying). Only defaulted value is `arrayFormat: 'brackets'`, so if you pass this object as `opts` to the method;

```javascript
const opts = {
  query: { /* ... */},
};
```

it is going to be like this;

```javascript
const opts = {
  query: { /* ... */},
  arrayFormat: 'brackets',
};
```

> Please note that the `path` is the path component of a URL described in [RFC 3986](https://tools.ietf.org/html/rfc3986#section-3).

Examples;

```javascript
Router.url('/users'); // '/users'
Router.url('/products/by/acme'); // '/products/by/acme'

Router.url('/users/:userId', { userId: 42 }); // '/users/42'
Router.url('/users/:userId/posts/:postId', { userId: 42, postId: 13 }); // '/users/42/posts/13'

Router.url('/users/:userId/posts', { userId: 42 }, { query: { sort: ['-date', 'title'] }, encode: false });
// '/users/42/posts?sort[]=-date&sort[]=title'

Router.url('/users', {}, { query: { sort: ['-date', 'title'], foo: { bar: 1, baz: false } }, encode: false });
// '/users?sort[]=-date&sort[]=title&foo[bar]=1&foo[baz]=false'
Router.url('/users', {}, { query: { sort: ['-date', 'title'], foo: { bar: 1, baz: false } }, allowDots: true, encode: false });
// '/users?sort[]=-date&sort[]=title&foo.bar=1&foo.baz=false'

// NOTE `encode: false` is for demonstration purposes only
```

### Router([options])

Create a new router instance.

#### Options

Name|Default|Description
---|---|---
pathPrefix|`''`|The path prefix that will be added to **every** path
scopeSeparator|`''`|Scope name separator
reverseScopeNaming|`false`|Deeper scope names pulled in front

Examples;

```javascript
const router = new Router({ pathPrefix: '/api' });

router.get('/hello', (ctx) => {
  ctx.body = 'world';
});

// Navigate to '/api/hello' to see 'world' response.
// The path '/hello' will result in 404 Not Found.
```

```javascript
const router = new Router({ scopeSeparator: '.' });

router.scope('Users', '/users', (users) => {
  users.get('Index', '/', (ctx) => {
    ctx.body = [
      // ...
    ];
  });
});

// Notice the '.' between the scope names.
router.url('Users.Index'); // '/users'
```

```javascript
const router = new Router({ reverseScopeNaming: true });

router.scope('Users', '/users', (users) => {
  users.scope('One', '/:username', (user) => {
    user.get('Profile', '/profile', (ctx) => {
      const username = ctx.params.username;

      ctx.body = `Hello, my name is ${username}`;
    });
  });
});

// Notice that the order is inside-out (reversed),
// not in order (not 'UsersOneProfile').
router.url('ProfileOneUsers', { username: 'john-doe' }); // '/users/john-doe/profile'
```

### router[get|post|put|delete|patch]\(args)

Arguments list may be one of;

1. path, handler
1. name, path, handler
1. path, handler, meta
1. name, path, handler, meta

where;

* 'path' is a `string` starting with /,
* 'handler' is a `function`,
* 'name' is a `string`,
* 'meta' is an `object`.

Here are quick tips to remember the method signature;

* 'path' always followed by 'handler',
* 'name' is the 1st parameter if defined,
* 'meta' is the last parameter if defined.

Those methods (i.e. `router.get()`, `router.post()`) provided by the default layer. Layer is merely a class to ease scoping by proxying the registration of the routes to the router. It's an interesting concept, and we encourage you to take a peek at the source code to better understand it.

### router.scope(args)

Arguments list may be one of;

1. path, scopeFn
1. name, path, scopeFn
1. path, scopeFn, meta
1. name, path, scopeFn, meta

where;

* 'path' is a `string` starting with /,
* 'scopeFn' is a `function`,
* 'name' is a `string`,
* 'meta' is an `object`.

Here are quick tips to remember the method signature;

* 'path' always followed by 'scopeFn',
* 'name' is the 1st parameter if defined,
* 'meta' is the last parameter if defined.

`scopeFn` is a function which gets the layer for the scope as the first parameter;

```javascript
router.scope('/users', (users) => {
  // `users` here is a layer instance
});
```

you can continue to nest the routes in it;

```javascript
router.scope('/users', (users) => {
  // `users` here is a layer instance
  users.get('/', (ctx) => { ctx.body = 'Users index'; });
});
```

### router.register(routes)

While it has designed to be used internally while registering the routes by `router.get()` etc. in classic style, there was a need has arisen to make it public in order to make it useful for Vue Router style too. So, as with most of the others methods of the Router instance, it has variadic argument list. But to encourage you to use the HTTP verb methods (i.e. `router.get()`, `router.post()` so on and so forth) on the router instance (actually from the default layer of the router instance) we are not going to document it's former arguments list (the one used internally). If you are willingly to see it please consult the source code.

This method was made public just for the Vue Router style routes definition. Define your routes as an array and then pass it to this method, like the way we have done in the usage examples above. But for in any case here's a quick example;

```javascript
const Router = require('@rezeus/korauter');

const router = new Router();

const routes = [
  {
    path: '/',
    handler: (ctx) => { ctx.body = 'Homepage'; },
  },
  //
];

router.register(routes);
```

### router.resolve()

This is an optional middleware for the Koa app (to be used as `app.use(router.resolve())`) to match the requested URL with a registered one. If a match has found it will be registered to the context (i.e. `ctx.route`). This middleware must be used in conjunction with `router.handle()`, but may be omitted as well. The main purpose of this middleware is to segregate the control of how the route handler (i.e. the action in the MVC lingo) is resolved, and to response with 404 error if no corresponding route has been found.

### router.handle()

This is the middleware where resolved route's handler (i.e. action) is called. If the route hasn't been resolved yet (i.e. the request URL hasn't been found among the registered routes), resolves first and then calls the handler.

### router.routes()

This is a middleware to alias `router.handle()` for convenience and compatibility with the other routers out in the wild. Please see `router.handle()` for the description.

## Roadmap

* [x] Tests (still VIP)
* [x] Types
* [ ] Support for `405 Method Not Allowed`
* [x] Query parameters for the `.url()`, along with the named parameters
* [ ] ~Multiple middleware support per route~

## Acknowledgements

* Concept inspired by [koa-router](https://github.com/alexmingoia/koa-router), kudos [alexmingoia](https://github.com/alexmingoia).
* Underlying tree implementation is [route-trie](https://github.com/zensh/route-trie) by [Yan Qing](https://github.com/zensh).
* Meta data inspired by [Vue Router](https://github.com/vuejs/vue-router). Thanks [Evan You](https://github.com/yyx990803) and [all the contributors](https://github.com/vuejs/vue-router/graphs/contributors) for making this awesome router.

## Comparison with Other Packages

### koa-router

In contrast to the koa-router, Korauter does not use middlewares for the route handlers. Alternative for that to use the middleware and control it by meta data of the route in question. For example;

```javascript
const Koa = require('koa');
const Router = require('@rezeus/korauter');

const app = new Koa();
const router = new Router();

function authMiddleware(ctx, next) {
  if (!ctx.route.meta.requiresAuth) {
    await next();
    return; // skip header check
  }

  // Check and verify authorization header
}
app.use(router.resolve());
app.use(authMiddleware);
app.use(router.handle());

router.get('/', (ctx) => { ctx.body = 'Homepage'; });
router.get('/secret', (ctx) => { ctx.body = 'Secret page'; }, { requiresAuth: true });

// '/secret' requires authentication, thus `authMiddleware` won't skip header check
```

## License

MIT License

Copyright (c) 2018 Ozan Müyesseroğlu

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
