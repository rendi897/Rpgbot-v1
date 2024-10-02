// Fungsi utama untuk memproses command RPG
async function processRpgCommand(sock, message, sender) {
    const command = message.message.conversation.trim();

    if (command === '!rpg start') {
        await sock.sendMessage(sender, { text: 'Permainan RPG dimulai! Selamat bermain.' });
        // Logika RPG lebih lanjut bisa ditambahkan di sini
    } else if (command === '!rpg status') {
        // Contoh sederhana cek status
        await sock.sendMessage(sender, { text: 'Status permainan RPG: Level 1, XP 100' });
    } else {
        await sock.sendMessage(sender, { text: 'Command RPG tidak dikenali.' });
    }
}

module.exports = { processRpgCommand };
