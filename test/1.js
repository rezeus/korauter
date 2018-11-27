'use strict';

const chai = require('chai');
const qs = require('qs');

const Router = require('../lib/Router');

const expect = chai.expect;

describe('Router.url', function() {
  it('should return the path if no params and query', function() {
    const path = '/orders';

    const url = Router.url(path);

    expect(url).to.be.eq(path);
  });

  it('with query params (default, square-bracket notation)', function() {
    const path = '/orders';
    const params = {};
    const opts = {
      query: {
        q: '1032503',
        sort: ['-id', 'userId'],
        foo: {
          bar: true,
          baz: false,
        },
      },
      encode: false,
    };

    const url = Router.url(path, params, opts);

    const expected = '/orders?q=1032503&sort[]=-id&sort[]=userId&foo[bar]=true&foo[baz]=false';

    expect(url).to.be.eq(expected);
  });

  it('2 (dot notation)', function() {
    const path = '/orders';
    const params = {};
    const opts = {
      query: {
        q: '1032503',
        sort: ['-id', 'userId'],
        foo: {
          bar: true,
          baz: false,
        },
      },
      encode: false,
      allowDots: true,
    };

    const url = Router.url(path, params, opts);

    const expected = '/orders?q=1032503&sort[]=-id&sort[]=userId&foo.bar=true&foo.baz=false';

    expect(url).to.be.eq(expected);
  });

  it('3', function() {
    const path = '/orders/by/:userId/from/:providerName';
    const params = {
      userId: 42,
      providerName: 'provider-a',
    };
    const opts = {
      query: {
        q: '1032503',
        sort: ['-id', 'userId'],
        foo: {
          bar: true,
          baz: false,
        },
      },
      encode: false,
    };

    const url = Router.url(path, params, opts);

    const expected = '/orders/by/42/from/provider-a?q=1032503&sort[]=-id&sort[]=userId&foo[bar]=true&foo[baz]=false';

    expect(url).to.be.eq(expected);
  });

  it('4', function() {
    expect(Router.url('/users/:id', { id: 1 })).to.be.eq('/users/1');
  });

  it('5', function() {
    expect(Router.url('/users/:id', { id: 1 }, { query: { active: true } })).to.be.eq('/users/1?active=true');
  });

  describe('Compatibility with ljharb/qs', function() {
    it('1', function() {
      // From '../3'
      const path = '/orders/by/:userId/from/:providerName';
      const params = {
        userId: 42,
        providerName: 'provider-a',
      };
      const opts = {
        query: {
          q: '1032503',
          sort: ['-id', 'userId'],
          foo: {
            bar: 'true',
            baz: 'false',
          },
        },
        encode: false,
      };

      const url = Router.url(path, params, opts);


      const queryPart = url.substring(url.indexOf('?') + 1);
      const parsed = qs.parse(queryPart);

      expect(parsed).to.deep.eq(opts.query);
    });

    //
  });

  describe('Asynchronous methods of controllers (actions)', function() {
    it('should not await for synchronous action (synchronous handling)', function() {
      const router = new Router();

      router.get('/sync', (ctx) => {
        ctx.body = 'Hello World from synchronous action';
      });


      // Create pseudo-context for the request
      const ctx = {
        method: 'get',
        path: '/sync',
        body: undefined,
      };

      const handle = router.handle();
      handle(ctx);


      expect(ctx.body).to.be.eq('Hello World from synchronous action');
      //
    });

    it('should not await for synchronous action (asynchronous handling)', async function() {
      const router = new Router();

      router.get('/sync', (ctx) => {
        ctx.body = 'Hello World from synchronous action';
      });


      // Create pseudo-context for the request
      const ctx = {
        method: 'get',
        path: '/sync',
        body: undefined,
      };

      const handle = router.handle();
      await handle(ctx);


      expect(ctx.body).to.be.eq('Hello World from synchronous action');
      //
    });


    it('should await for asyncronous action marked with async keyword', async function() {
      const router = new Router();

      const delay = async (ms, resolveWith = undefined) => new Promise((resolve) => {
        setTimeout(() => {
          resolve(resolveWith);
        }, ms);
      });

      router.get('/async', async (ctx) => {
        const message = await delay(50, '50 ms delayed from async action');

        ctx.body = message;
      });


      // Create pseudo-context for the request
      const ctx = {
        method: 'get',
        path: '/async',
        body: undefined,
      };

      const handle = router.handle();
      await handle(ctx);


      expect(ctx.body).to.be.eq('50 ms delayed from async action');
      //
    });

    it('should await for asyncronous action that returns promise', async function() {
      const router = new Router();

      const delay = async (ms, resolveWith = undefined) => new Promise((resolve) => {
        setTimeout(() => {
          resolve(resolveWith);
        }, ms);
      });

      router.get('/async', async ctx => new Promise((resolve) => {
        delay(75, '75 ms delayed from promise-returning action').then((message) => {
          ctx.body = message;

          resolve();
        });
      }));


      // Create pseudo-context for the request
      const ctx = {
        method: 'get',
        path: '/async',
        body: undefined,
      };

      const handle = router.handle();
      await handle(ctx);


      expect(ctx.body).to.be.eq('75 ms delayed from promise-returning action');
      //
    });

    //
  });

  //
});

describe('router.url', function() {
  const router = new Router();

  router.get('Home', '/', (ctx) => { ctx.body = 'Home'; });
  router.get('About', '/about', (ctx) => { ctx.body = 'Testing App'; });
  router.scope('Users', '/users', (users) => {
    users.get('Index', '/', (ctx) => { ctx.body = 'All users'; });
    users.get('View', '/:userId', (ctx) => { ctx.body = `User with the ID of ${ctx.params.userId}`; });
  });

  it('1', function() {
    const url = router.url('Home');

    const expected = '/';

    expect(url).to.be.eq(expected);
  });

  it('2', function() {
    const url = router.url('About');

    const expected = '/about';

    expect(url).to.be.eq(expected);
  });

  it('3.1', function() {
    expect(router.url.bind(router, 'Users')).to.throw('Named route (Users) does not exist.');
  });

  it('3.2', function() {
    const url = router.url('UsersIndex');

    const expected = '/users';

    expect(url).to.be.eq(expected);
  });

  it('4.1', function() {
    const url = router.url('UsersView', { userId: 42 });

    const expected = '/users/42';

    expect(url).to.be.eq(expected);
  });

  it('4.2', function() {
    const url = router.url('UsersView', { userId: 42 }, {
      query: { sort: ['-id', 'name'] },
      encode: false,
    });

    const expected = '/users/42?sort[]=-id&sort[]=name';

    expect(url).to.be.eq(expected);
  });
});
