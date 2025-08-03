const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Conectado ao MongoDB'))
.catch((err) => console.error('❌ Erro ao conectar no MongoDB:', err));

const userSchema = new mongoose.Schema({
  username: String,
  password: String
});

const User = mongoose.model('User', userSchema);

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
  secret: 'segredo',
  resave: false,
  saveUninitialized: true,
}));

// Rotas HTML
app.get('/', (_, res) => res.sendFile(path.join(__dirname, 'public/menu.html')));
app.get('/user/login.html', (_, res) => res.sendFile(path.join(__dirname, 'public/user/login.html')));
app.get('/user/register.html', (_, res) => res.sendFile(path.join(__dirname, 'public/user/register.html')));

// Registro
app.post('/register', async (req, res) => {
  const { username, password, confirmPassword } = req.body;

  if (!username || !password || !confirmPassword) {
    return res.send('Preencha todos os campos!');
  }

  if (password !== confirmPassword) {
    return res.send('❌ As senhas não coincidem!');
  }

  const userExists = await User.findOne({ username });
  if (userExists) {
    return res.send('❌ Nome de usuário já está em uso.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({ username, password: hashedPassword });

  res.send('✅ Registro bem-sucedido. Você pode fazer login agora.');
});

// Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) {
    return res.send('❌ Conta não encontrada.');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.send('❌ Senha incorreta.');
  }

  req.session.user = user;
  res.send('✅ Login bem-sucedido!');
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
