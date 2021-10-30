const { Backend } = require('./lib/backend/backend');
const config = require('./config');

async function main() {
  const backend = new Backend({
    port: process.env.PORT || config.http.port || 4000,
  });
  await backend.start();
}

main();