// Fungsi untuk memberikan warna pada output terminal
const chalk = require('chalk');

function color(text, colorName) {
    return chalk.keyword(colorName)(text);
}

module.exports = { color };
