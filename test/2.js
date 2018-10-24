'use strict';

const http = require('http');

const expect = require('expect.js');
const Koa = require('koa');
const request = require('supertest');
// const should = require('should');

const Router = require('../lib/Router');

describe.skip('Router', function() {
  it('creates new router with koa app', function (done) {
    var app = new Koa();
    var router = new Router();
    router.should.be.instanceOf(Router);
    done();
  });

  it('shares context between routers (gh-205)', function (done) {
    var app = new Koa();
    var router1 = new Router();
    var router2 = new Router();
    router1.get('/', function (ctx, next) {
      ctx.foo = 'bar';
      return next();
    });
    router2.get('/', function (ctx, next) {
      ctx.baz = 'qux';
      ctx.body = { foo: ctx.foo };
      return next();
    });
    app.use(router1.routes()).use(router2.routes());
    request(http.createServer(app.callback()))
      .get('/')
      .expect(200)
      .end(function (err, res) {
        // if (err) return done(err);
        expect(err).to.be(null);

        expect(res.body).to.have.property('foo', 'bar');
        done();
      });
  });

  it.skip('does not register middleware more than once (gh-184)', function (done) {
    const app = new Koa();
    const parentRouter = new Router();
    const nestedRouter = new Router();

    nestedRouter
      .get('/first-nested-route', function (ctx, next) {
        ctx.body = { n: ctx.n };
      })
      .get('/second-nested-route', function (ctx, next) {
        return next();
      })
      .get('/third-nested-route', function (ctx, next) {
        return next();
      });

    parentRouter.use('/parent-route', function (ctx, next) {
      ctx.n = ctx.n ? (ctx.n + 1) : 1;
      return next();
    }, nestedRouter.routes());

    app.use(parentRouter.routes());

    request(http.createServer(app.callback()))
      .get('/parent-route/first-nested-route')
      .expect(200)
      .end(function (err, res) {
        // if (err) return done(err);
        expect(err).to.be(null);

        expect(res.body).to.have.property('n', 1);
        done();
      });
  });

  it('router can be accessed with ctx', function (done) {
    var app = new Koa();
    var router = new Router();
    app.context.router = router;
    router.get('home', '/', function (ctx) {
      ctx.body = {
        url: ctx.router.url('home'),
      };
    });
    app.use(router.routes());
    request(http.createServer(app.callback()))
      .get('/')
      .expect(200)
      .end(function (err, res) {
        // if (err) return done(err);
        expect(err).to.be(null);

        expect(res.body.url).to.eql('/');
        done();
      });
  });

  // TODO [MLTMWSUP] Multiple middlewares support
  it.skip('registers multiple middleware for one route', function(done) {
    var app = new Koa();
    var router = new Router();

    router.get('/double', function(ctx, next) {
      return new Promise(function(resolve, reject) {
        setTimeout(function() {
          ctx.body = {message: 'Hello'};
          resolve(next());
        }, 1);
      });
    }, function(ctx, next) {
      return new Promise(function(resolve, reject) {
        setTimeout(function() {
          ctx.body.message += ' World';
          resolve(next());
        }, 1);
      });
    }, function(ctx, next) {
      ctx.body.message += '!';
    });

    app.use(router.routes());

    request(http.createServer(app.callback()))
      .get('/double')
      .expect(200)
      .end(function (err, res) {
        // if (err) return done(err);
        expect(err).to.be(null);

        expect(res.body.message).to.eql('Hello World!');
        done();
      });
  });

  // NOTE No nested routes - use scope instead
  it.skip('does not break when nested-routes use regexp paths', function (done) {
    var app = new Koa();
    var parentRouter = new Router();
    var nestedRouter = new Router();

    nestedRouter
      .get(/^\/\w$/i, function (ctx, next) {
        return next();
      })
      .get('/first-nested-route', function (ctx, next) {
        return next();
      })
      .get('/second-nested-route', function (ctx, next) {
        return next();
      });

    parentRouter.use('/parent-route', function (ctx, next) {
      return next();
    }, nestedRouter.routes());

    app.use(parentRouter.routes());
    app.should.be.ok;
    done();
  });

  it('exposes middleware factory', function (done) {
    var app = new Koa();
    var router = new Router();
    router.should.have.property('routes');
    router.routes.should.be.type('function');
    var middleware = router.routes();
    should.exist(middleware);
    middleware.should.be.type('function');
    done();
  });

  it('supports promises for async/await', function (done) {
    var app = new Koa();
    app.experimental = true;
    var router = new Router();
    router.get('/async', function (ctx, next) {
      return new Promise(function (resolve, reject) {
        setTimeout(function() {
          ctx.body = {
            msg: 'promises!'
          };
          resolve();
        }, 1);
      });
    });

    app.use(router.routes()); // .use(router.allowedMethods());
    request(http.createServer(app.callback()))
      .get('/async')
      .expect(200)
      .end(function (err, res) {
        // if (err) return done(err);
        expect(err).to.be(null);

        expect(res.body).to.have.property('msg', 'promises!');
        done();
      });
  });

  it.skip('matches middleware only if route was matched (gh-182)', function (done) {
    var app = new Koa();
    var router = new Router();
    var otherRouter = new Router();

    router.use(function (ctx, next) {
      ctx.body = { bar: 'baz' };
      return next();
    });

    otherRouter.get('/bar', function (ctx) {
      ctx.body = ctx.body || { foo: 'bar' };
    });

    app.use(router.routes()).use(otherRouter.routes());

    request(http.createServer(app.callback()))
      .get('/bar')
      .expect(200)
      .end(function (err, res) {
        // if (err) return done(err);
        expect(err).to.be(null);

        expect(res.body).to.have.property('foo', 'bar');
        expect(res.body).to.not.have.property('bar');
        done();
      })
  });

  // FIXME Error: no / before catch-all in path '/user/(.*).jsx'
  it.skip('matches first to last', function (done) {
    var app = new Koa();
    var router = new Router();

    router
      .get('user_page', '/user/(.*).jsx', function (ctx) {
        ctx.body = { order: 1 };
      })
      .all('app', '/app/(.*).jsx', function (ctx) {
        ctx.body = { order: 2 };
      })
      .all('view', '(.*).jsx', function (ctx) {
        ctx.body = { order: 3 };
      });

    request(http.createServer(app.use(router.routes()).callback()))
      .get('/user/account.jsx')
      .expect(200)
      .end(function (err, res) {
        // if (err) return done(err);
        expect(err).to.be(null);

        expect(res.body).to.have.property('order', 1);
        done();
      })
  });

  // TODO [MLTMWSUP]
  it.skip('does not run subsequent middleware without calling next', function (done) {
    var app = new Koa();
    var router = new Router();

    router
      .get('user_page', '/user/(.*).jsx', function (ctx) {
        // no next()
      }, function (ctx) {
        ctx.body = { order: 1 };
      });

    request(http.createServer(app.use(router.routes()).callback()))
      .get('/user/account.jsx')
      .expect(404)
      .end(done)
  });

  // NOTE No nested routes - use scope instead
  it.skip('nests routers with prefixes at root', function (done) {
    var app = new Koa();
    var api = new Router();
    var forums = new Router({
      prefix: '/forums'
    });
    var posts = new Router({
      prefix: '/:fid/posts'
    });
    var server;

    posts
      .get('/', function (ctx, next) {
        ctx.status = 204;
        return next();
      })
      .get('/:pid', function (ctx, next) {
        ctx.body = ctx.params;
        return next();
      });

    forums.use(posts.routes());

    server = http.createServer(app.use(forums.routes()).callback());

    request(server)
      .get('/forums/1/posts')
      .expect(204)
      .end(function (err) {
        // if (err) return done(err);
        expect(err).to.be(null);


        request(server)
          .get('/forums/1')
          .expect(404)
          .end(function (err) {
            // if (err) return done(err);
            expect(err).to.be(null);


            request(server)
              .get('/forums/1/posts/2')
              .expect(200)
              .end(function (err, res) {
                // if (err) return done(err);
                expect(err).to.be(null);


                expect(res.body).to.have.property('fid', '1');
                expect(res.body).to.have.property('pid', '2');
                done();
              });
          });
      });
  });

  // NOTE No nested routes - use scope instead
  it.skip('nests routers with prefixes at path', function (done) {
    var app = new Koa();
    var api = new Router();
    var forums = new Router({
      prefix: '/api'
    });
    var posts = new Router({
      prefix: '/posts'
    });
    var server;

    posts
      .get('/', function (ctx, next) {
        ctx.status = 204;
        return next();
      })
      .get('/:pid', function (ctx, next) {
        ctx.body = ctx.params;
        return next();
      });

    forums.use('/forums/:fid', posts.routes());

    server = http.createServer(app.use(forums.routes()).callback());

    request(server)
      .get('/api/forums/1/posts')
      .expect(204)
      .end(function (err) {
        // if (err) return done(err);
        expect(err).to.be(null);


        request(server)
          .get('/api/forums/1')
          .expect(404)
          .end(function (err) {
            // if (err) return done(err);
            expect(err).to.be(null);


            request(server)
              .get('/api/forums/1/posts/2')
              .expect(200)
              .end(function (err, res) {
                // if (err) return done(err);
                expect(err).to.be(null);


                expect(res.body).to.have.property('fid', '1');
                expect(res.body).to.have.property('pid', '2');
                done();
              });
          });
      });
  });

  // NOTE No nested routes - use scope instead
  it.skip('runs subrouter middleware after parent', function (done) {
    var app = new Koa();
    var subrouter = Router()
      .use(function (ctx, next) {
        ctx.msg = 'subrouter';
        return next();
      })
      .get('/', function (ctx) {
        ctx.body = { msg: ctx.msg };
      });
    var router = Router()
      .use(function (ctx, next) {
        ctx.msg = 'router';
        return next();
      })
      .use(subrouter.routes());
    request(http.createServer(app.use(router.routes()).callback()))
      .get('/')
      .expect(200)
      .end(function (err, res) {
        // if (err) return done(err);
        expect(err).to.be(null);

        expect(res.body).to.have.property('msg', 'subrouter');
        done();
      });
  });

  // NOTE No nested routes - use scope instead
  it.skip('runs parent middleware for subrouter routes', function (done) {
    var app = new Koa();
    var subrouter = Router()
      .get('/sub', function (ctx) {
        ctx.body = { msg: ctx.msg };
      });
    var router = Router()
      .use(function (ctx, next) {
        ctx.msg = 'router';
        return next();
      })
      .use('/parent', subrouter.routes());
    request(http.createServer(app.use(router.routes()).callback()))
      .get('/parent/sub')
      .expect(200)
      .end(function (err, res) {
        // if (err) return done(err);
        expect(err).to.be(null);

        expect(res.body).to.have.property('msg', 'router');
        done();
      });
  });

  it('matches corresponding requests', function (done) {
    var app = new Koa();
    var router = new Router();
    app.use(router.routes());
    router.get('/:category/:title', function (ctx) {
      ctx.should.have.property('params');
      ctx.params.should.have.property('category', 'programming');
      ctx.params.should.have.property('title', 'how-to-node');
      ctx.status = 204;
    });
    router.post('/:category', function (ctx) {
      ctx.should.have.property('params');
      ctx.params.should.have.property('category', 'programming');
      ctx.status = 204;
    });
    router.put('/:category/not-a-title', function (ctx) {
      ctx.should.have.property('params');
      ctx.params.should.have.property('category', 'programming');
      ctx.params.should.not.have.property('title');
      ctx.status = 204;
    });
    var server = http.createServer(app.callback());
    request(server)
      .get('/programming/how-to-node')
      .expect(204)
      .end(function (err, res) {
        // if (err) return done(err);
        expect(err).to.be(null);

        request(server)
          .post('/programming')
          .expect(204)
          .end(function (err, res) {
            // if (err) return done(err);
            expect(err).to.be(null);

            request(server)
              .put('/programming/not-a-title')
              .expect(204)
              .end(function (err, res) {
                done(err);
              });
          });
      });
  });

  it.skip('executes route middleware using `app.context`', function (done) {
    var app = new Koa();
    var router = new Router();
    app.use(router.routes());
    router.use(function (ctx, next) {
      ctx.bar = 'baz';
      return next();
    });
    router.get('/:category/:title', function (ctx, next) {
      ctx.foo = 'bar';
      return next();
    }, function (ctx) {
      ctx.should.have.property('bar', 'baz');
      ctx.should.have.property('foo', 'bar');
      ctx.should.have.property('app');
      ctx.should.have.property('req');
      ctx.should.have.property('res');
      ctx.status = 204;
      done();
    });
    request(http.createServer(app.callback()))
      .get('/match/this')
      .expect(204)
      .end(function (err) {
        // if (err) return done(err);
        expect(err).to.be(null);
      });
  });

  it('does not match after ctx.throw()', function (done) {
    var app = new Koa();
    var counter = 0;
    var router = new Router();
    app.use(router.routes()).use(async (ctx, next) => { counter++; await next(); });
    router.get('/', function (ctx) {
      counter++;
      ctx.throw(403);
    });
    // router.get('/', function () {
    //   counter++;
    // });
    var server = http.createServer(app.callback());
      request(server)
      .get('/')
      .expect(403)
      .end(function (err, res) {
        // if (err) return done(err);
        expect(err).to.be(null);

        counter.should.equal(1);
        done();
    });
  });

  it.skip('supports promises for route middleware', function (done) {
    var app = new Koa();
    var router = new Router();
    app.use(router.routes());
    var readVersion = function () {
      return new Promise(function (resolve, reject) {
        var packagePath = path.join(__dirname, '..', '..', 'package.json');
        fs.readFile(packagePath, 'utf8', function (err, data) {
          if (err) return reject(err);
          resolve(JSON.parse(data).version);
        });
      });
    };
    router
      .get('/', function (ctx, next) {
        return next();
      }, function (ctx) {
        return readVersion().then(function () {
          ctx.status = 204;
        });
      });
    request(http.createServer(app.callback()))
      .get('/')
      .expect(204)
      .end(done);
  });

  describe('Router#[verb]()', function () {
    const methods = [
      'get',
      'post',
      'put',
      'head',
      'del', // 'delete',
      'options',
      'trace',
    ];

    it('registers route specific to HTTP verb', function () {
      var app = new Koa();
      var router = new Router();
      app.use(router.routes());
      methods.forEach(function (method) {
        router.should.have.property(method);
        router[method].should.be.type('function');
        router[method]('/', function () {});
      });
      router.stack.should.have.length(methods.length);
    });

    it('registers route with a regexp path', function () {
      var router = new Router();
      methods.forEach(function (method) {
        router[method](/^\/\w$/i, function () {}).should.equal(router);
      });
    });

    it('registers route with a given name', function () {
      var router = new Router();
      methods.forEach(function (method) {
        router[method](method, '/', function () {}).should.equal(router);
      });
    });

    it('registers route with with a given name and regexp path', function () {
      var router = new Router();
      methods.forEach(function (method) {
        router[method](method, /^\/$/i, function () {}).should.equal(router);
      });
    });

    it('enables route chaining', function () {
      var router = new Router();
      methods.forEach(function (method) {
        router[method]('/', function () {}).should.equal(router);
      });
    });

    it('registers array of paths (gh-203)', function () {
      var router = new Router();
      router.get(['/one', '/two'], function (ctx, next) {
        return next();
      });
      expect(router.stack).to.have.property('length', 2);
      expect(router.stack[0]).to.have.property('path', '/one');
      expect(router.stack[1]).to.have.property('path', '/two');
    });

    it('resolves non-parameterized routes without attached parameters', function(done) {
      var app = new Koa();
      var router = new Router();

      router.get('/notparameter', function (ctx, next) {
        ctx.body = {
          param: ctx.params.parameter,
        };
      });

      router.get('/:parameter', function (ctx, next) {
        ctx.body = {
          param: ctx.params.parameter,
        };
      });

      app.use(router.routes());
      request(http.createServer(app.callback()))
        .get('/notparameter')
        .expect(200)
        .end(function (err, res) {
          // if (err) return done(err);
          expect(err).to.be(null);


          expect(res.body.param).to.equal(undefined);
          done();
        });
    });
  });

  //
});
