import { generateKeyPairSync } from 'node:crypto';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const privPath = resolve(process.cwd(), 'frontend/.ssh/fitqvibes_ed25519');
const pubPath = privPath + '.pub';

mkdirSync(dirname(privPath), { recursive: true });

const { publicKey, privateKey } = generateKeyPairSync('ed25519');

const priv = privateKey.export({ type: 'pkcs8', format: 'pem' });

// Build OpenSSH public key from JWK (x is base64url raw 32-byte key)
const jwk = publicKey.export({ format: 'jwk' });
const x_b64url = jwk.x; // base64url
const x = Buffer.from(x_b64url.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
const type = Buffer.from('ssh-ed25519');
const len = Buffer.alloc(4); len.writeUInt32BE(type.length, 0);
const keyLen = Buffer.alloc(4); keyLen.writeUInt32BE(x.length, 0);
const blob = Buffer.concat([len, type, keyLen, x]);
const ssh = `ssh-ed25519 ${blob.toString('base64')} fitqvibes`;

mkdirSync(dirname(privPath), { recursive: true });
writeFileSync(privPath, priv, { mode: 0o600 });
writeFileSync(pubPath, ssh + '\n', { mode: 0o644 });

console.log('Private key written to', privPath);
console.log('OpenSSH public key written to', pubPath);
console.log('\n' + ssh + '\n');
