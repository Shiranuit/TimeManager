const express = require('express');
const app = express();
const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  password: 'postgres',
  host: 'localhost',
  database: 'gotham'
});

app.get('/', function (req, res) {
  res.send('hello world');
})

app.get('/findByUsername', async function (req, res) {
  if (!req.query.username) {
    return res.status(400).send({
      error: 'Missing username'
    });
  }

  const result = await client.query('SELECT username, email, role, team FROM users WHERE username = $1::text;', [req.query.username])
  res.send(result.rows);
});

app.listen(8080, async () => {
  console.log('Listening on port 8080');
  await client.connect();
});