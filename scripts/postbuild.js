import fs from 'fs';

function copy(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.cpSync(src, dest, { recursive: true });
}

copy('.next/static', '.next/standalone/.next/static');
copy('public', '.next/standalone/public');

console.log('Copiados assets standalone.');
