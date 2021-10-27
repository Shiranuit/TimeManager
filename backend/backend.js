const express = require('express');
const app = express();
const { Client } = require('pg');

app.use(express.json());

const client = new Client({
  user: 'postgres',
  password: 'postgres',
  host: 'localhost',
  database: 'gotham'
});

app.get('/', function (req, res) {
  res.send('hello world');
})

app.get('/api/users', async (req, res) => {
  const result = await client.query('SELECT * FROM users;');
  res.send(result.rows);
});

app.get('/api/users/:id', async (req, res) => {
  const result = await client.query('SELECT * FROM users WHERE id = $1;', [req.params.id]);

  if (result.rows.length === 0) {
    return res.status(404).send({
      error: 'Not found'
    });
  }

  res.send({
    result: result.rows[0]
  });
});

app.post('/api/users', async (req, res) => {

  if (!req.body) {
    return res.status(400).send({
      error: 'Bad request, missing body'
    });
  }

  if (!req.body.firstname) {
    return res.status(400).send({
      error: 'Missing "firstname" inside request body'
    });
  }

  if (!req.body.lastname) {
    return res.status(400).send({
      error: 'Missing "lastname" inside request body'
    });
  }

  const result = await client.query('INSERT INTO users(firstname, lastname) VALUES($1, $2) RETURNING id;', [req.body.firstname, req.body.lastname]);
  res.send({
    result: result.rows[0]
  });
});

app.put('/api/users/:id', async (req, res) => {

  if (!req.body) {
    return res.status(400).send({
      error: 'Bad request, missing body'
    });
  }

  if (!req.body.firstname) {
    return res.status(400).send({
      error: 'Missing "firstname" inside request body'
    });
  }

  if (!req.body.lastname) {
    return res.status(400).send({
      error: 'Missing "lastname" inside request body'
    });
  }

  const result = await client.query('UPDATE users SET firstname = $1, lastname = $2 WHERE id = $3 RETURNING firstname, lastname;', [req.body.firstname, req.body.lastname, req.params.id]);

  if (result.rowCount === 0) {
    return res.status(404).send({
      error: 'Not found'
    });
  }

  res.send({
    result: result.rows[0]
  });
});

app.delete('/api/users/:id', async (req, res) => {
  const result = await client.query('DELETE FROM users WHERE id = $1 RETURNING firstname, lastname;', [req.params.id]);

  if (result.rowCount === 0) {
    return res.status(404).send({
      error: 'Not found'
    });
  }

  res.send({
    result: true
  });
})

app.get('/api/tasks', async (req, res) => {
  const result = await client.query('SELECT * FROM tasks;');
  res.send(result.rows);
});

app.get('/api/tasks/:id', async (req, res) => {
  const result = await client.query('SELECT * FROM tasks WHERE id = $1;', [req.params.id]);

  if (result.rows.length === 0) {
    return res.status(404).send({
      error: 'Not found'
    });
  }

  res.send({
    result: result.rows[0]
  });
});

app.post('/api/tasks', async (req, res) => {

  if (!req.body) {
    return res.status(400).send({
      error: 'Bad request, missing body'
    });
  }

  if (!req.body.userId) {
    return res.status(400).send({
      error: 'Missing userId inside request body'
    });
  }

  if (!req.body.title) {
    return res.status(400).send({
      error: 'Missing "title" inside request body'
    });
  }

  const result = await client.query('INSERT INTO tasks(title, description, status, user_id) VALUES($1, $2, $3, $4) RETURNING id;', [req.body.title, req.body.description, req.body.status, req.body.userId]);
  res.send({
    result: result.rows[0]
  });
});

app.listen(8080, async () => {
  console.log('Listening on port 8080');
  await client.connect();
});