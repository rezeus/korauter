# korauter

Yet another Koa router, inspired by Vue Router.

## Features

* Express-style routing; e.g. `router.get`, `router.post`
* Named routes for URL generation with named URL parameters
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
    path: '/',
    // Rest is same
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

## Roadmap

* [ ] Tests
* [ ] Types
* [ ] Support for `405 Method Not Allowed`
* [ ] Query parameters for the `.url()`, along with the named parameters
* [ ] Multiple middleware support per route

## Acknowledgements

* Concept inspired by [koa-router](https://github.com/alexmingoia/koa-router), kudos [alexmingoia](https://github.com/alexmingoia).
* Tree implementation was taken from [koa-tree-router](https://github.com/steambap/koa-tree-router), special thanks to [steambap](https://github.com/steambap/koa-tree-router) for her/his (_pardon me Weilin Shi_) amazing work of porting the tree implementation.
* Thanks [julienschmidt](https://github.com/julienschmidt) for implementing the tree in the first place ([httprouter](https://github.com/julienschmidt/httprouter)).
* Meta data inspired by [Vue Router](https://github.com/vuejs/vue-router). Thanks [Evan You](https://github.com/yyx990803) and [all the contributors](https://github.com/vuejs/vue-router/graphs/contributors) for making this awesome router.

## License
MIT License

Copyright (c) 2017 - 2018 Weilin Shi
              2018 Ozan Müyesseroğlu

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

