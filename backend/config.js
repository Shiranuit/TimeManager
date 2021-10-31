module.exports = {
  http: {
    host: 'localhost',
    port: 4000,
  },
  auth: {
    maxLoginAttempts: 3,  // Max attemps per seconds
    password: {
      hash: 'sha256',
    },
    jwt: {
      algorithm: 'HS256',
    }
  },
  postgres: {
    host: 'localhost',
    // port: 5432,
    database: 'gotham',
    user: 'postgres',
    password: 'postgres',
  }
};