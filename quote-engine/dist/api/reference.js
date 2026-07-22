// Five Star Conveyancing — quote reference generator
// Produces the opaque, non-guessable token used in URLs (Stage 3) and as
// the saved-quote resume link (Stage 5/2 decision: email-link only, no
// accounts). Cryptographically random — never sequential or derived from
// client data, so a reference can't be guessed or enumerated.
import { randomBytes } from 'node:crypto';
const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // no 0/O/1/I — avoids transcription errors if ever read aloud
export function generateQuoteReference() {
    const bytes = randomBytes(16);
    let token = '';
    for (const byte of bytes) {
        token += ALPHABET[byte % ALPHABET.length];
    }
    // Group into blocks for readability, e.g. FSC-8K2N-QX7T-4M9P-2WJH
    const blocks = token.match(/.{1,4}/g) ?? [token];
    return `FSC-${blocks.join('-')}`;
}
