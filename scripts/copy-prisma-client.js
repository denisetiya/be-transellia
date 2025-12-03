const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '..', 'src', 'generated');
const targetDir = path.join(__dirname, '..', 'dist', 'generated');

if (!fs.existsSync(sourceDir)) {
  console.error('Prisma client not found. Run `pnpm db:generate` before building.');
  process.exit(1);
}

fs.mkdirSync(targetDir, { recursive: true });
fs.cpSync(sourceDir, targetDir, { recursive: true });

console.log(`Copied Prisma client from ${sourceDir} to ${targetDir}`);
