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
      secret: process.env.JWT_SECRET || 'verysecurepassword',
      algorithm: 'HS256',
    },
  },
  vault: {
    algorithm: 'sha256',
    salt: process.env.VAULT_SECRET || 'verysecurepassword',
    derivationRound: parseInt(process.env.DERIVATION_ROUND) || 100000,
  },
  postgres: {
    maxRetries: 60,
    retryDelay: '1s',
    host: process.env.DB_HOST || 'postgres',
    database: process.env.DB_NAME || 'postgres',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_USER_PASSWORD || 'postgres',
  }
};