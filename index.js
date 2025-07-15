const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User'); // Certifique-se de que o caminho está correto
require('dotenv').config();

app.use(express.static('public/jogo/user'));
app.use(express.json());

// Conectar ao MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB conectado!');
}).catch(err => {
  console.error('Erro ao conectar:', err);
});

// Rota de registro
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Preencha todos os campos' });

  try {
    const hashed = await bcrypt.hash(password, 10);
    await User.create({ username, passwordHash: hashed });
    res.json({ message: 'Usuário criado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar usuário', details: error.message });
  }
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`servidor rodando na porta ${port}`);
});



