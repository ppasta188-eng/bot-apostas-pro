const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  }
});

client.on('qr', (qr) => {
  console.log('📲 ESCANEIE O QR:');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('✅ BOT CONECTADO!');
});

client.on('message', message => {
  if (message.body.toLowerCase() === 'oi') {
    message.reply('🔥 Bot funcionando!');
  }
});

client.initialize();
