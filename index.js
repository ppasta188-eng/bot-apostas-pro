const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const pino = require('pino')

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth')

    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        auth: state
    })

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update

        if (qr) {
            console.log('\n📲 ESCANEIE O QR ABAIXO:\n')
            require('qrcode-terminal').generate(qr, { small: true })
        }

        if (connection === 'open') {
            console.log('✅ BOT CONECTADO!')
        }

        if (connection === 'close') {
            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut

            console.log('❌ Conexão fechada. Reconectando...', shouldReconnect)

            if (shouldReconnect) {
                startBot()
            }
        }
    })

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0]

        if (!msg.message) return

        const text =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text

        if (!text) return

        if (text.toLowerCase() === 'oi') {
            await sock.sendMessage(msg.key.remoteJid, {
                text: '🔥 Bot funcionando!'
            })
        }
    })
}

startBot()
