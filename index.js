const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const pino = require('pino')
const express = require('express')

const app = express()

app.get('/', (req, res) => {
    res.send('Bot rodando 🚀')
})

app.listen(process.env.PORT || 3000, () => {
    console.log('🌐 Servidor web ativo')
})

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
            console.log('\n📲 ESCANEIE O QR:\n')
            require('qrcode-terminal').generate(qr, { small: true })
        }

        if (connection === 'open') {
            console.log('✅ BOT CONECTADO!')
        }

        if (connection === 'close') {
            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut

            console.log('❌ Conexão caiu, tentando de novo...')

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
