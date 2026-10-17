#!/usr/bin/env node
/**
 * Makes one CMS_USERS entry for the e-mail login of the admin panel.
 *   node hash-password.mjs doctor@example.de 'a long password'
 * Prints "mail:salt.hash". Join several entries with commas and store the
 * result as the PRAXIS_CMS_USERS secret. Same scrypt defaults as oauth-server.mjs.
 */
import { randomBytes, scryptSync } from 'node:crypto';

const [mail, password] = process.argv.slice(2);
if (!mail || !password || password.length < 12) {
  console.error("Usage: node hash-password.mjs <mail> '<password, at least 12 characters>'");
  process.exit(1);
}
const salt = randomBytes(16);
console.log(`${mail.toLowerCase()}:${salt.toString('hex')}.${scryptSync(password, salt, 32).toString('hex')}`);
