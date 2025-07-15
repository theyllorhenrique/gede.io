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

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  await User.create({ username, passwordHash: hashed });
  res.json({ message: 'Usuário criado com sucesso' });
});
