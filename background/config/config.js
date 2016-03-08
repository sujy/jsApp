var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'background'
    },
    host: '0.0.0.0',
    port: 9000,
    db: 'mongodb://localhost/background-development'
  },

  test: {
    root: rootPath,
    app: {
      name: 'background'
    },
    port: 9000,
    db: 'mongodb://localhost/background-test'
  },

  production: {
    root: rootPath,
    app: {
      name: 'background'
    },
    port: 9000,
    db: 'mongodb://localhost/background-production'
  }
};

module.exports = config[env];
