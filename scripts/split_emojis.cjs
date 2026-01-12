const fs = require('fs');
const path = require('path');

// Read the original file
const emojiDataPath = path.join(__dirname, '../node_modules/emojibase-data/en/compact.json');
const outputDir = path.join(__dirname, '../src/assets/emojis');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const rawData = fs.readFileSync(emojiDataPath, 'utf8');
const emojis = JSON.parse(rawData);

const CHUNK_SIZE = 100;
const chunks = [];

for (let i = 0; i < emojis.length; i += CHUNK_SIZE) {
    const chunk = emojis.slice(i, i + CHUNK_SIZE);
    chunks.push(chunk);
}

chunks.forEach((chunk, index) => {
    const filePath = path.join(outputDir, `chunk-${index}.json`);
    fs.writeFileSync(filePath, JSON.stringify(chunk));
    console.log(`Written ${filePath}`);
});

console.log(`Total chunks: ${chunks.length}`);
