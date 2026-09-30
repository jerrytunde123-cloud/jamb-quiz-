const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const REPO_URL = 'https://github.com/jerrytunde123-cloud/Jamb-Lab.git';
const COMMIT = 'fdcf45e63aa8ef572a991ae8649f4f6387c323c4';
const TMP = path.join(__dirname, '.tmp-jamblab');
const SOURCE = path.join(TMP, 'assets', 'images');
const DEST = path.join(__dirname, 'public', 'images');

function sh(cmd) {
  console.log(`$ ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
}

function rmrf(p) {
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}

console.log('📸 Importing question images from GitHub…\n');

// 1. Clean previous clone
rmrf(TMP);

// 2. Sparse clone
sh(`git clone --filter=blob:none --no-checkout ${REPO_URL} ${TMP}`);
sh(`git -C ${TMP} sparse-checkout init --cone`);
sh(`git -C ${TMP} sparse-checkout set assets/images`);
sh(`git -C ${TMP} checkout ${COMMIT}`);

// 3. Copy images
if (!fs.existsSync(SOURCE)) {
  console.error(`❌ Source folder not found: ${SOURCE}`);
  process.exit(1);
}
if (!fs.existsSync(DEST)) fs.mkdirSync(DEST, { recursive: true });

const files = fs.readdirSync(SOURCE).filter(f =>
  /\.(jpe?g|png|gif|webp|svg)$/i.test(f)
);

let copied = 0;
for (const file of files) {
  const src = path.join(SOURCE, file);
  const dst = path.join(DEST, file);
  fs.copyFileSync(src, dst);
  copied++;
}

console.log(`\n✅ Copied ${copied} images → public/images/`);

// 4. Clean up
rmrf(TMP);
console.log('🧹 Cleaned up temporary clone');
