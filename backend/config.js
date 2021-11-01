module.exports = {
  logger: {
    debug: true,
  },
  http: {
    host: 'localhost',
    port: 4000,
  },
  auth: {
    maxLoginAttempts: 3,  // Max attemps per seconds
    username: {
      minLength: 3,
    },
    password: {
      minLength: 8,
    },
    jwt: {
      secret: 'verysecurepassword',
      algorithm: 'HS256',
    },
  },
  vault: {
    algorithm: 'sha256'
  },
  postgres: {
    maxRetries: 60,
    retryDelay: '1s',
    host: 'postgres',
    // port: 5432,
    database: 'gotham',
    user: 'gotham',
    password: 'gotham',
  }
};