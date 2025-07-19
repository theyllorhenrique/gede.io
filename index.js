const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 🔌 Conexão com MongoDB
const mongoUrl = 'mongodb+srv://shettvyb:<db_password>@cluster0.evu5vho.mongodb.net/usuariosDB';
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB conectado!"))
  .catch(err => console.error("❌ Erro MongoDB:", err));

// 🧩 Modelo do usuário
const User = mongoose.model('User', new mongoose.Schema({
  username: String,
  password: String,
  isAdmin: { type: Boolean, default: false }
}));

// 🔐 Sessão
app.use(session({
  secret: 'segredoSuperSecreto',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl })
}));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 📦 Rotas
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  const exists = await User.findOne({ username });
  if (exists) return res.status(409).json({ error: 'Usuário já existe.' });

  const hash = await bcrypt.hash(password, 10);
  const isAdmin = username === 'admin';
  const user = new User({ username, password: hash, isAdmin });
  await user.save();
  res.status(201).json({ message: 'Conta registrada com sucesso!' });
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: 'Senha incorreta.' });

  req.session.user = { username: user.username, isAdmin: user.isAdmin };
  res.json({ message: 'Login bem-sucedido!', isAdmin: user.isAdmin });
});

app.get('/api/auth/me', (req, res) => {
  if (req.session.user) {
    res.json(req.session.user);
  } else {
    res.status(401).json({ error: 'Não autenticado' });
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login.html');
});

// Inicia servidor
app.listen(PORT, () => console.log(`✅ Servidor rodando em http://localhost:${PORT}`));
