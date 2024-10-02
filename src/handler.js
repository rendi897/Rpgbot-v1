const { processRpgCommand } = require('./function'); // Memanggil fungsi RPG utama
const { formatMessage } = require('./utils'); // Menggunakan utilitas untuk format pesan

// Fungsi untuk menangani pesan yang masuk
async function handleMessage(sock, message, sender) {
    try {
        const text = message.message.conversation || message.message.extendedTextMessage?.text;

        if (!text) return;

        // Format pesan yang diterima
        const formattedMessage = formatMessage(text);

        // Cek jika pesan mengandung command RPG
        if (formattedMessage.startsWith('!rpg')) {
            await processRpgCommand(sock, message, sender);
        } else {
            // Balasan default untuk pesan biasa
            await sock.sendMessage(sender, { text: 'Command tidak dikenali. Gunakan !rpg untuk perintah RPG.' });
        }
    } catch (error) {
        console.error('Error menangani pesan:', error);
    }
}

module.exports = { handleMessage };
