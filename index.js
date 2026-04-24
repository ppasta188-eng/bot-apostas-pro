import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason
} from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import qrcode from 'qrcode'

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth')

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false
  })

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update

    // 🔥 AQUI GERA O QR
    if (qr) {
      console.log('📲 ESCANEIE O QR ABAIXO:')

      const qrImage = await qrcode.toDataURL(qr)
      console.log(qrImage)
    }

    if (connection === 'close') {
      const shouldReconnect =
        (lastDisconnect?.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut

      console.log('❌ Conexão fechada. Reconectando...', shouldReconnect)

      if (shouldReconnect) {
        startBot()
      }
    } else if (connection === 'open') {
      console.log('✅ BOT CONECTADO!')
    }
  })

  sock.ev.on('creds.update', saveCreds)

  // 👇 TESTE DE RESPOSTA
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0]
    if (!msg.message) return

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text

    if (text?.toLowerCase() === 'oi') {
      await sock.sendMessage(msg.key.remoteJid, {
        text: '🔥 Bot ativo!'
      })
    }
  })
}

startBot()
