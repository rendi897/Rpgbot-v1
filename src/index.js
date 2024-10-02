const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeInMemoryStore } = require('@whiskeysockets/baileys');
const pino = require('pino');
const chalk = require('chalk');
const figlet = require('figlet');
const open = require('open');
const { handleMessage } = require('./handler'); // Menghubungkan handler
const { color } = require('./lib/color'); // Warna terminal

// Membatasi jumlah listener agar tidak melebihi default
require('events').EventEmitter.defaultMaxListeners = 150;

// Membuat in-memory store untuk menyimpan sesi dan logging
const store = makeInMemoryStore({
    logger: pino().child({ level: 'silent', stream: 'store' }),
});

// Menampilkan banner di terminal
console.log(
    color(
        figlet.textSync('RPG Bot', {
            font: 'DOS Rebel',
            horizontalLayout: 'default',
            vertivalLayout: 'default',
            width: 80,
            whitespaceBreak: false,
        }),
        'cyan'
    )
);

// Fungsi utama untuk memulai bot dan pairing QR code
async function startRpgBot() {
    // Mendapatkan versi WhatsApp terbaru yang didukung oleh Baileys
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(chalk.green(`Menggunakan versi WhatsApp: v${version.join('.')} (terbaru: ${isLatest})`));

    // Menggunakan autentikasi multi file untuk menyimpan sesi
    const { state, saveCreds } = await useMultiFileAuthState('./auth');

    // Membuat koneksi socket
    const sock = makeWASocket({
        version,
        auth: state,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: true, // QR code ditampilkan di terminal
    });

    // Menangani perubahan koneksi
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log(chalk.blue('Silakan scan QR code dengan WhatsApp Anda!'));
        }

        if (connection === 'open') {
            console.log(chalk.green('Bot RPG terhubung ke WhatsApp!'));

            // Membuka URL halaman setelah pairing sukses (opsional)
            open('https://yourwebsite.com/success'); // Gantilah URL dengan halaman web yang relevan
        } else if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                console.log(chalk.red('Koneksi terputus, mencoba sambung ulang...'));
                startRpgBot();
            } else {
                console.log(chalk.red('Autentikasi gagal, silakan hapus folder auth dan coba ulang.'));
            }
        }
    });

    // Menyimpan kredensial ketika ada pembaruan
    sock.ev.on('creds.update', saveCreds);

    // Menangani pesan yang masuk
    sock.ev.on('messages.upsert', async (msg) => {
        const message = msg.messages[0];
        if (!message.message) return;

        const sender = message.key.remoteJid;
        console.log(`Pesan diterima dari ${sender}:`, message);

        // Memanggil handler untuk menangani logika RPG berdasarkan pesan
        await handleMessage(sock, message, sender);
    });
}

// Mulai bot RPG
startRpgBot();
