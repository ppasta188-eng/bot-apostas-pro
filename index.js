const express = require('express');
const mongoose = require('mongoose');

const app = express();

// =====================
// 🔗 CONEXÃO MONGODB
// =====================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB conectado"))
  .catch(err => console.log("❌ Erro MongoDB:", err));

// =====================
// 🚀 ROTA TESTE
// =====================
app.get('/', (req, res) => {
  res.send('🔥 Bot rodando com MongoDB!');
});

// =====================
// 🌐 SERVIDOR
// =====================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
