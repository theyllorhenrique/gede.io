require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const path = require('path');
const User = require('./models/User');

const app = express();
app.use(express.json());
app.use(express.static('public'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conectado ao MongoDB'))
  .catch(err => console.error('Erro MongoDB:', err));

// Registro
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  const exists = await User.findOne({ username });
  if (exists) return res.json({ error: 'Usuário já existe!' });

  const hashed = await bcrypt.hash(password, 10);
  const isAdmin = username === 'admin'; // define admin pela lógica
  await User.create({ username, password: hashed, isAdmin });

  res.json({ message: 'Conta criada com sucesso!' });
});

// Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.json({ error: 'Usuário não encontrado!' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.json({ error: 'Senha incorreta!' });

  res.json({ message: 'Login bem-sucedido!', isAdmin: user.isAdmin });
});

// Página principal
app.get('/', (_, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Servidor rodando em http://localhost:${PORT}`));

