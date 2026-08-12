const express = require('express');
const pool = require('./db/connection');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Training Gacha API funcionando!'
  });
});

app.get('/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');

    res.json({
      message: 'Banco conectado com sucesso!',
      time: result.rows[0].now
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Erro ao conectar com o banco'
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});