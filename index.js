const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB conectado!');
}).catch(err => {
  console.error('Erro ao conectar:', err);
});

app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Preencha todos os campos' });

  try {
    const existente = await User.findOne({ username });
    if (existente) return res.status(400).json({ error: 'Usuário já existe' });

    const hashed = await bcrypt.hash(password, 10);
    await User.create({ username, passwordHash: hashed });

    res.json({ message: 'Usuário criado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar usuário', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
