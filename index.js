import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys'
import QRCode from 'qrcode'

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth')

  const sock = makeWASocket({
    auth: state
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update

    // 🔥 GERAR QR EM LINK
    if (qr) {
      const qrImage = await QRCode.toDataURL(qr)
      console.log('\n📲 ABRA ESSE LINK NO NAVEGADOR:\n')
      console.log(qrImage)
    }

    if (connection === 'close') {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut

      console.log('❌ Conexão fechada. Reconectando...', shouldReconnect)

      if (shouldReconnect) startBot()
    }

    if (connection === 'open') {
      console.log('✅ BOT WHATSAPP CONECTADO!')
    }
  })

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0]
    if (!msg.message) return

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text

    const from = msg.key.remoteJid

    console.log('📩 Mensagem:', text)

    if (text === 'oi') {
      await sock.sendMessage(from, { text: '🔥 Bot online!' })
    }
  })
}

startBot()
