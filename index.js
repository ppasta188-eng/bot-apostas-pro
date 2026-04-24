import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} from '@whiskeysockets/baileys'
import qrcode from 'qrcode'
import { Boom } from '@hapi/boom'

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth')

  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    browser: ['Chrome', 'Android', '1.0.0']
  })

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update

    // 🔥 FORÇA QR
    if (qr) {
      console.log('\n📲 ESCANEIE O QR:\n')

      const qrImage = await qrcode.toString(qr, {
        type: 'terminal'
      })

      console.log(qrImage)
    }

    if (connection === 'close') {
      const shouldReconnect =
        (lastDisconnect?.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut

      console.log('❌ Conexão fechada. Reconectando...', shouldReconnect)

      if (shouldReconnect) {
        startBot()
      }
    }

    if (connection === 'open') {
      console.log('✅ BOT CONECTADO!')
    }
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0]
    if (!msg.message) return

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text

    if (text?.toLowerCase() === 'oi') {
      await sock.sendMessage(msg.key.remoteJid, {
        text: '🔥 Bot funcionando!'
      })
    }
  })
}

startBot()
