const express = require('express');
const app = express();
const port = 3000;
require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB conectado!');
}).catch(err => {
  console.error('Erro ao conectar:', err);
});

app.use(express.static('public'));

app.listen(port, () => {
  console.log(`servidor rodando na porta ${port}`);
});
