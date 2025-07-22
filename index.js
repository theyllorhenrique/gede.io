// index.js
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Conectar ao MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('✅ Conectado ao MongoDB'))
  .catch(err => console.error('Erro ao conectar no MongoDB:', err));

// Schema de usuário
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  isAdmin: { type: Boolean, default: false }
});
const User = mongoose.model('User', userSchema);

// Configurações
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: 'segredo_super_secreto',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions'
  })
}));

app.use(express.static(path.join(__dirname, 'public')));

// Rotas
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) return res.status(400).json({ error: 'Campos obrigatórios' });

  const userExist = await User.findOne({ username });
  if (userExist) return res.status(409).json({ error: 'Usuário já existe' });

  const hash = await bcrypt.hash(password, 10);
  const isAdmin = username === 'admin'; // Regra: se nome for admin → admin verdadeiro

  const user = new User({ username, password: hash, isAdmin });
  await user.save();

  res.json({ message: 'Conta criada com sucesso!' });
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: 'Senha incorreta' });

  req.session.user = {
    username: user.username,
    isAdmin: user.isAdmin
  };

  res.json({ message: 'Login bem-sucedido', isAdmin: user.isAdmin });
});

app.get('/api/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ message: 'Logout realizado' });
  });
});

// Início
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando: http://localhost:${PORT}`);
});
