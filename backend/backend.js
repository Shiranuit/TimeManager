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
});

// app.get('/findByUsername', async function (req, res) {
//   if (!req.query.username) {
//     return res.status(400).send({
//       error: 'Missing username'
//     });
//   }

//   const result = await client.query('SELECT username, email, role, team FROM users WHERE username = $1::text;', [req.query.username])
//   res.send(result.rows);
// });

// UPDATE table
// SET nom_colonne_1 = 'nouvelle valeur'
// WHERE condition

app.put('/api/tasks/:id', async function(req, res) {
  const result = await client.query('UPDATE tasks SET title=$1, description=$2, status=$3, user_id=$4 WHERE id = $5 RETURNING *', [req.body.title, req.body.description, req.body.status, req.body.user_id, req.params.id])
  res.send({
    result: result.rows[0]
  });  
}); 

app.get('/api/tasks/users/:idUser', async function(req, res) {
   
    const result = await client.query('SELECT title, description, status, user_id FROM tasks WHERE user_id = $1;', [req.params.idUser])
    if (result.rows.length === 0) {
      return res.status(404).send({
        error: 'the task is unknown'
      });
    }
    res.send({
      result: result.rows[0]
    });  
});

app.listen(8080, async () => {
  console.log('Listening on port 8080');
  await client.connect();
});