const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = 3000;

// Garante que o arquivo users.json exista
if (!fs.existsSync('users.json')) {
  fs.writeFileSync('users.json', '[]');
}

// Middlewares
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'segredo-super-seguro',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

// Funções auxiliares
function loadUsers() {
  try {
    const data = fs.readFileSync('users.json', 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

function saveUsers(users) {
  fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
}

// Rota de registro
app.post('/api/auth/register', async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password)
    return res.status(400).json({ error: 'Preencha todos os campos.' });

  const users = loadUsers();
  const exists = users.find(u => u.username === username);

  if (exists)
    return res.status(409).json({ error: 'Usuário já existe.' });

  const hashed = await bcrypt.hash(password, 10);
  const userRole = role === 'admin' ? 'admin' : 'user';
  users.push({ username, password: hashed, role: userRole });
  saveUsers(users);

  res.status(201).json({ message: 'Conta registrada com sucesso!' });
});

// Rota de login
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ error: 'Usuário e senha obrigatórios.' });

  const users = loadUsers();
  const user = users.find(u => u.username === username);

  if (!user)
    return res.status(404).json({ error: 'Usuário não encontrado.' });

  const match = await bcrypt.compare(password, user.password);
  if (!match)
    return res.status(401).json({ error: 'Senha incorreta.' });

  req.session.user = { username: user.username, role: user.role };
  res.json({ message: 'Login bem-sucedido!' });
});

// Rota para logout
app.get('/api/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login.html');
  });
});

// Rota para pegar dados da sessão
app.get('/api/auth/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Não autenticado' });
  }
  res.json(req.session.user);
});

// Inicia servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});