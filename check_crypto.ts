import { randomUUID, randomBytes } from 'crypto';

try {
  console.log('randomUUID:', randomUUID());
  console.log('randomBytes:', randomBytes(3).toString('hex'));
} catch (e) {
  console.error('Error checking crypto:', e);
}
