const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware para ler JSON do body e servir arquivos públicos
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Carrega usuários do JSON
function loadUsers() {
  try {
    const data = fs.readFileSync('users.json', 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

// Salva usuários no JSON
function saveUsers(users) {
  fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
}

// Rota de cadastro
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ error: 'Preencha todos os campos.' });

  const users = loadUsers();
  const userExists = users.find(u => u.username === username);

  if (userExists)
    return res.status(409).json({ error: 'Usuário já existe.' });

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword });
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

  const senhaCorreta = await bcrypt.compare(password, user.password);
  if (!senhaCorreta)
    return res.status(401).json({ error: 'Senha incorreta.' });

  res.json({ message: 'Login bem-sucedido!' });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});
