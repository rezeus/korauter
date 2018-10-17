'use strict';

// NOTE This is router usage example file

if (process.env.NODE_ENV !== 'test') {
  throw new Error('Example file must be run in test environment.');
}


const http = require('http');

const Koa = require('koa'); // eslint-disable-line import/no-extraneous-dependencies

// const Router = require('korauter');
const Router = require('./lib/Router');


const router = new Router({
  // pathPrefix: '/api',
  // scopeSeparator: '.',
  // reverseScopeNaming: true,
});

const app = new Koa();


const dbUsers = [
  { username: 'john.doe', password: 'john@does.co' },
  { username: 'jane.doe', password: 'jane@does.co' },
];

const PagesController = {
  /** @param {Koa.Context} ctx */
  index(ctx) {
    ctx.body = 'Hello World!';
  },
  /** @param {Koa.Context} ctx */
  about(ctx) {
    // NOTE This action raises Error implicitly
    ctx.body = number / 0;
  },
  /** @param {Koa.Context} ctx */
  secret(ctx) {
    ctx.body = { message: 'This is a secret place' };
  },
  /** @param {Koa.Context} ctx */
  settings(ctx) {
    // TODO
  },
  //
};

const UsersController = {
  /** @param {Koa.Context} ctx */
  async index(ctx, next) {
    ctx.body = dbUsers;

    await next();
  },
  /** @param {Koa.Context} ctx */
  create(ctx) {
    const newUser = { username: 'baby.doe', password: 'baby@does.co' };

    dbUsers.push(newUser);

    ctx.status = 201;
    ctx.body = newUser;
  },
  /** @param {Koa.Context} ctx */
  view(ctx) {
    const username = ctx.params.username;

    const user = dbUsers.find(dbUser => dbUser.username === username);

    if (user === undefined) {
      ctx.throw(404);
    }

    ctx.body = user;
  },
  /** @param {Koa.Context} ctx */
  remove(ctx) {
    const username = ctx.params.username;

    const indexOnDbUsers = dbUsers.findIndex(dbUser => dbUser.username === username);

    if (indexOnDbUsers > -1) {
      dbUsers.splice(indexOnDbUsers, 1);
    }

    ctx.body = null;
  },
  //
};

const AuthController = {
  /** @param {Koa.Context} ctx */
  login(ctx) {
    // TODO
  },
  //
};

const PostsController = {
  /** @param {Koa.Context} ctx */
  index(ctx) {
    // TODO
  },
  /** @param {Koa.Context} ctx */
  view(ctx) {
    // TODO
  },
  /** @param {Koa.Context} ctx */
  remove(ctx) {
    const postId = ctx.params.postId;

    ctx.body = { message: `Post with ID ${postId} was deleted.` };
  },
};

const CommentsController = {
  /** @param {Koa.Context} ctx */
  index(ctx) {
    const { postId, commentId } = ctx.params;

    // TODO
  },
  /** @param {Koa.Context} ctx */
  view(ctx) {
    const { postId, commentId } = ctx.params;

    // TODO
  },
};

/** @param {Koa.Context} ctx */
const MetasyntacticController = (ctx) => {
  const { message = 'No message' } = ctx.route.meta;

  ctx.body = { message };
};


// Koa style
//
router.get('/', PagesController.index);
router.get('About', '/about', PagesController.about);
router.get('/secret', PagesController.secret, { requiresAuth: true });
router.get('Settings', '/settings', PagesController.settings, { requiresAuth: true });

router.scope('User', '/users', (users) => {
  users.get('Index', '/', UsersController.index);
  users.post('Create', '/', UsersController.create, { requiresAuth: false });
  // users.get('View', '/:username', UsersController.view);
  // users.del('/:username', UsersController.remove);
  users.scope('/:username', (user) => {
    user.get('View', '/', UsersController.view);
    user.del('/', UsersController.remove);
  });
}, { requiresAuth: true });

router.get('/files/*filename', (ctx) => {
  ctx.body = {
    filename: ctx.params.filename,
    content: 'lorem ipsum dolor sit amet.',
  };
});

console.log(router.url('About')); // `/about`
console.log(router.url('UserView', { username: 'john.doe' })); // `/users/john.doe`
// NOTE 'UserView' due to `scopeSeparator = ''` \
//      might be 'ViewUser' if `reverseScopeNaming` was set to `true`

router.scope('/posts', (posts) => {
  posts.get('AllPosts', '/', PostsController.index);

  posts.scope('Post', '/:postId', (post) => {
    // get the 'postId' via `ctx.params`
    post.get('ViewPost', '/', PostsController.view);
    // post.del('DeletePost', '/', PostsController.remove);

    post.scope('Comments', '/comments', (comments) => {
      comments.get('Index', '/', CommentsController.index);
      // also get the 'commentId' via `ctx.params`
      comments.get('View', '/:commentId', CommentsController.view);
    });
  });
});
router.del('DeletePost', '/posts/:postId', PostsController.remove, {
  // this is the meta data object for this route
  requiresAuth: true,
});

console.log(router.url('PostCommentsView', { postId: 42, commentId: 3 })); // `/posts/42/comments/3`


// Vue Router style
//
const routes = [
  {
    method: 'post',
    // method: ['post', 'put']
    path: '/token',
    handler: AuthController.login,
    meta: {
      requiresAuth: true,
    },
    name: 'Login',
  },
  {
    // NOTE No 'method'
    path: '/metasyntactic',
    // NOTE No 'handler'
    // NOTE This record is NOT routable due to lack of both 'method' and 'handler'
    meta: {
      message: 'Metasyntactic variables used commonly across all programming languages include foobar, foo, bar, baz, qux, quux, quuz, corge, grault, garply, waldo, fred, plugh, xyzzy, and thud.',
    },
    children: [
      // TODO Decide a child w/o 'path' will be omitted or treated as parent's?
      {
        method: 'get',
        path: 'foo', // `/metasyntactic/foo`
        handler: MetasyntacticController,
        // NOTE No 'meta', inherits from parent
      },
      {
        // NOTE No 'method'
        path: 'ba', // `/metasyntactic/ba`
        handler: MetasyntacticController,
        // NOTE No 'method' but has 'handler', therefore 'method' is GET implicitly
        meta: {
          message: 'Also see /r and /metasyntactic/ba/z',
        },
        children: [
          {
            path: '/r', // `/r`
            handler: MetasyntacticController,
            meta: {
              message: 'Seems like bar, but not exactly',
            },
            name: 'Bar',
          },
          {
            path: 'z', // `/metasyntactic/ba/z`
            handler: MetasyntacticController,
            meta: {
              message: 'You have found ba/z',
            },
            name: 'Baz',
            children: [
              {
                // FIXME [DEEPNSTDPRM] `.url()` on this route (w/ params) not working as expected
                path: ':no', // `/metasyntactic/ba/z/:no`
                handler: (/** @type {Koa.Context} */ ctx) => {
                  const messageFromMeta = ctx.route.meta.message;
                  const no = ctx.params.no;

                  ctx.body = {
                    message: `${messageFromMeta} (w/ no: ${no})`,
                  };
                },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '/posts',
    children: [
      {
        path: 'mine',
        handler: (ctx) => {
          ctx.body = {
            data: [
              { id: 13, title: 'My First Post' },
              { id: 19, title: 'My Second Post' },
            ],
          };
        },
      },
    ],
  },
];

const defaultMeta = { requiresAuth: false };

router.register(routes, defaultMeta);
// router.register(routes);

console.log(router.url('Bar'));
console.log(router.url('Baz'));
console.log(router.url('Baz', { no: 42 })); // FIXME [DEEPNSTDPRM] Should return `/metasyntactic/ba/z/42` but returns `/metasyntactic/ba/z`


async function errorHandler(ctx, next) {
  try {
    await next();
  } catch (err) {
    if (typeof err.status === 'number') {
      // `ctx.throw()`

      const body = {
        error: {
          status: err.status,
          message: (process.env.NODE_ENV === 'production')
            ? http.STATUS_CODES[err.status]
            : err.message,
          // by default code is 0, meaning that the code was undefined (but exists in the response)
          code: 0,
        },
      };
      if (Object.prototype.hasOwnProperty.call(err, 'code')) {
        // App-specific error code
        body.error.code = err.code;
      }
      //

      // Convert the response to JSON
      ctx.status = err.status;
      ctx.body = body;
    } else {
      // These are developer mistakes, MUST be fixed before release
      // (thus throwing back again without handling anything).
      // Let the app crash.
      // Also note that the response status will be 500 and the
      // body will be the type of 'text/plain'.

      throw err;
    }
  }
}


// The default error handler - MUST be the first one
app.use(errorHandler);

// Sample middleware from https://koajs.com
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
});

// app.use(router.routes());
// OR (for more granular control);
app.use(router.resolve());
app.use(async (ctx, next) => {
  if (ctx.route.meta.requiresAuth) {
    const header = ctx.header.authorization;

    ctx.assert(header, 403, 'No auth header', { code: 13 });
    // code 13: no auth header

    // TODO Verify access token
    if (header !== 'accessToken') {
      ctx.throw(403, { code: 14 });
      // code 14: invalid auth header value
    }
  }

  await next();
});
app.use(router.handle());

app.use((ctx) => {
  if (ctx.status === 404) {
    ctx.status = 404;
    ctx.body = {
      error: {
        status: 404,
        message: 'Not Found',
        code: 0, // code 0: code is undefined
      },
    };
  }
});


// NOTE Use this only for logging purposes, see `errorHandler`
//      middleware above to handle and response accordingly.
//      Set `app.silent = true;` and handle logging here
//      (instead of sending them to stderr).
// app.on('error', (/** @type {Error} */ err, /** @type {Koa.Context} */ ctx) => {
//   if (typeof err.status === 'number') {
//     // `ctx.throw()`

//     // Convert the response to JSON
//     ctx.body = {
//       error: {
//         status: err.status,
//         message: err.message,
//       },
//     };
//   } else {
//     // These are developer mistakes, MUST be fixed before release
//     // (thus throwing back again without handling anything).

//     throw err;
//   }
// });

app.listen(3000);
