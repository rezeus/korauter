'use strict';

/** @param {Array} args */
function extractArgsForMethod(args) {
  let name = '';
  let path;
  let handler;
  let meta = {};

  switch (args.length) {
    case 2: {
      // "path, handler"

      path = args[0];
      handler = args[1];

      break;
    }

    case 3: {
      // either "name, path, handler" (1) or "path, handler, meta" (2)

      switch (typeof args[1]) {
        // NOTE We are checking for the function first to make
        //      sure it _is_ a function, not a string (that
        //      was something coerced to string somehow)
        case 'function': {
          // (2)

          path = args[0];
          handler = args[1];
          meta = args[2];

          break;
        }

        case 'string': {
          // (1)

          name = args[0];
          path = args[1];
          handler = args[2];

          break;
        }

        default: {
          throw new SyntaxError('Arguments were sent in invalid sequence.');
        }
      }

      break;
    }

    case 4: {
      // "name, path, handler, meta"

      name = args[0];
      path = args[1];
      handler = args[2];
      meta = args[3];

      break;
    }

    default:
      throw new SyntaxError(`Invalid number of arguments (${args.length}).`);
  }

  return [name, path, handler, meta];
}

module.exports = {
  extractArgsForMethod,

  /** @param {Array} args */
  extractArgsForScope(args) {
    const arr = extractArgsForMethod(args);

    return {
      namePrefix: arr[0],
      pathPrefix: arr[1],
      scopeFn: arr[2],
      meta: arr[3],
    };
  },
};
