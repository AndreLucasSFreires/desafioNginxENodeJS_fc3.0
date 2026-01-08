const express = require('express');
const mysql = require('mysql');
const app = express();
const port = 3000;

const config = {
  host: 'db',
  user: 'root',
  password: 'root',
  database: 'nodedb'
};

let connection;

function handleDisconnect() {
  connection = mysql.createConnection(config);

  connection.connect((err) => {
    if (err) {
      console.error('Erro ao conectar no DB, tentando novamente em 2 segundos...', err.message);
      setTimeout(handleDisconnect, 2000); 
    } else {
      console.log('Conectado ao MySQL com sucesso!');
      const createTable = `CREATE TABLE IF NOT EXISTS people(id INT NOT NULL AUTO_INCREMENT, name VARCHAR(255), PRIMARY KEY (id))`;
      connection.query(createTable);
    }
  });

  connection.on('error', (err) => {
    console.error('Erro no banco de dados:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      handleDisconnect();
    } else {
      throw err;
    }
  });
}

handleDisconnect();

app.get('/', (req, res) => {
  const name = `Pessoa-${Math.floor(Math.random() * 100)}`;
  const sqlInsert = `INSERT INTO people(name) VALUES('${name}')`;

  connection.query(sqlInsert, (err) => {
    if (err) {
      return res.status(500).send('Erro ao inserir no banco');
    }

    connection.query('SELECT name FROM people order by id desc limit 1', (err, results) => {
      if (err) {
        return res.status(500).send('Erro ao listar pessoas');
      }

      let tableRows = results.map(pessoa => `<li>${pessoa.name}</li>`).join('');
      
      res.send(`
        <h1>Full Cycle Rocks!</h1>
        <ul>${tableRows}</ul>
      `);
    });
  });
});

app.listen(port, () => {
  console.log(`Aplicação rodando na porta ${port}`);
});