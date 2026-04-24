import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys'
import qrcode from 'qrcode-terminal'

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth')

  const sock = makeWASocket({
    auth: state
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update

    // 🔥 MOSTRAR QR CORRETAMENTE
    if (qr) {
      console.log('\n📲 ESCANEIE O QR CODE:\n')
      qrcode.generate(qr, { small: true })
    }

    if (connection === 'close') {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut

      console.log('❌ Conexão fechada. Reconectando...', shouldReconnect)

      if (shouldReconnect) {
        startBot()
      }
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
      await sock.sendMessage(from, { text: '🔥 Fala! Bot online!' })
    }
  })
}

startBot()
