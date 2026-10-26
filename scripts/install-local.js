// Build VSIX lalu install ke VS Code lokal, hanya jika versi di package.json berbeda dari yang terpasang.
// Dari WSL, extension di-install ke VS Code Windows (bukan server WSL), karena fitur WSL <-> Windows harus jalan di sisi UI Windows.
// run: npm run install:local
const { execSync, execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const root = path.join(__dirname, '..');
const pkg = require(path.join(root, 'package.json'));
const id = `${pkg.publisher}.${pkg.name}`;
const force = process.argv.includes('--force');
const vsix = `${pkg.name}-${pkg.version}.vsix`;

const isWsl = process.platform === 'linux' && /microsoft/i.test(os.release());
// tanpa shell supaya backslash path \\wsl.localhost\... utuh; cmd.exe menolak cwd UNC, jadi jalankan dari /mnt/c
const code = (args, opts = {}) => isWsl
  ? execFileSync('cmd.exe', ['/c', 'code', ...args], { cwd: '/mnt/c', ...opts })
  : execFileSync('code', args, { cwd: root, shell: process.platform === 'win32', ...opts });

const run = (cmd) => execSync(cmd, { cwd: root, stdio: 'inherit' });

function installedVersion() {
  const list = code(['--list-extensions', '--show-versions'], { encoding: 'utf8' });
  const line = list.split(/\r?\n/).find((l) => l.toLowerCase().startsWith(`${id.toLowerCase()}@`));
  return line?.split('@')[1];
}

const installed = installedVersion();
if (installed === pkg.version && !force) {
  console.log(`[install-local] ${id}@${pkg.version} sudah terpasang. Tidak melakukan apa-apa.`);
  console.log('[install-local] Naikkan version di package.json (npm version patch), atau jalankan dengan -- --force.');
  process.exit(0);
}

console.log(`[install-local] ${id}: ${installed ?? 'belum terpasang'} -> ${pkg.version}${isWsl ? ' (VS Code Windows)' : ''}`);
run('npm run package');
if (isWsl) {
  // VS Code menolak install dari UNC (\\wsl.localhost), jadi salin VSIX ke %TEMP% Windows dulu
  const winTemp = execFileSync('cmd.exe', ['/c', 'echo %TEMP%'], { cwd: '/mnt/c', encoding: 'utf8' }).trim();
  const tempVsix = path.join(execFileSync('wslpath', ['-u', winTemp], { encoding: 'utf8' }).trim(), vsix);
  fs.copyFileSync(path.join(root, vsix), tempVsix);
  try {
    code(['--install-extension', `${winTemp}\\${vsix}`, '--force'], { stdio: 'inherit' });
  } finally {
    fs.rmSync(tempVsix, { force: true });
  }
} else {
  code(['--install-extension', path.join(root, vsix), '--force'], { stdio: 'inherit' });
}
console.log('[install-local] Selesai. Jalankan "Developer: Reload Window" di VS Code.');
