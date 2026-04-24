import makeWASocket, { useMultiFileAuthState } from '@whiskeysockets/baileys'
import { DisconnectReason } from '@whiskeysockets/baileys'
import qrcode from 'qrcode-terminal'

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth')

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      console.log('📲 ESCANEIE O QR CODE ABAIXO:')
      qrcode.generate(qr, { small: true })
    }

    if (connection === 'close') {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut

      console.log('❌ Conexão fechada. Reconectando...', shouldReconnect)

      if (shouldReconnect) {
        startBot()
      }
    } else if (connection === 'open') {
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

    console.log('📩 Mensagem recebida:', text)

    if (text === 'oi') {
      await sock.sendMessage(from, { text: '🔥 Fala! Bot de apostas online!' })
    }

    if (text === 'placar') {
      await sock.sendMessage(from, { text: '⚽ Palmeiras 2x1 Flamengo (exemplo)' })
    }
  })
}

startBot()
