const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = 3000;

// Garante que o arquivo users.json exista
const USERS_PATH = 'users.json';
if (!fs.existsSync(USERS_PATH)) {
  fs.writeFileSync(USERS_PATH, '[]');
}

// Middlewares
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'segredo_secreto',
  resave: false,
  saveUninitialized: false
}));

// Funções auxiliares
function loadUsers() {
  try {
    const data = fs.readFileSync(USERS_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

function saveUsers(users) {
  fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
}

// Rota de registro
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Preencha todos os campos.' });

  const users = loadUsers();
  const exists = users.find(u => u.username === username);
  if (exists)
    return res.status(409).json({ error: 'Usuário já existe.' });

  const hashed = await bcrypt.hash(password, 10);
  users.push({ username, password: hashed, isAdmin: false });
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

  req.session.user = {
    username: user.username,
    isAdmin: user.isAdmin
  };

  res.json({ message: 'Login bem-sucedido!', isAdmin: user.isAdmin });
});

// Rota protegida para o front saber se o usuário logado é admin
app.get('/api/auth/user', (req, res) => {
  if (!req.session.user)
    return res.status(401).json({ error: 'Não autenticado' });

  res.json(req.session.user);
});

// Gerador de hash de senha
const senha = 'admin123';
bcrypt.hash(senha, 10).then(hash => {
  console.log('Senha original:', senha);
  console.log('Hash gerado:', hash);
}).catch(err => {
  console.error('Erro ao gerar hash:', err);
});

// Inicia servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});
