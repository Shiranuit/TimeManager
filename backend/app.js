const { Backend } = require('./lib/backend/backend');
const config = require('./config');

const backend = new Backend({
  port: process.env.PORT || config.http.port || 4000,
});

backend.start();