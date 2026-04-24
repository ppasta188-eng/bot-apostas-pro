const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const qrcode = require('qrcode-terminal')

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth')

    const sock = makeWASocket({
        auth: state
    })

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update

        if (qr) {
            console.log('📱 ESCANEIE O QR:')
            qrcode.generate(qr, { small: true })
        }

        if (connection === 'open') {
            console.log('✅ BOT CONECTADO!')
        }

        if (connection === 'close') {
            const shouldReconnect =
                (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut

            if (shouldReconnect) {
                console.log('🔄 Reconectando...')
                startBot()
            } else {
                console.log('❌ Sessão perdida. Escaneie novamente.')
            }
        }
    })

    sock.ev.on('creds.update', saveCreds)
}

startBot()
