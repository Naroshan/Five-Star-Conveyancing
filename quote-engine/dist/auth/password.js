// Five Star Conveyancing — password hashing
// bcryptjs is pure JS (no native compile step), well-vetted, and adaptive
// (the cost factor can be raised later as hardware improves without
// breaking already-stored hashes — bcrypt encodes its own cost in the hash).
import bcrypt from 'bcryptjs';
const SALT_ROUNDS = 12;
export const MIN_PASSWORD_LENGTH = 12;
export class WeakPasswordError extends Error {
    constructor(message) {
        super(message);
        this.name = 'WeakPasswordError';
    }
}
export async function hashPassword(password) {
    if (password.length < MIN_PASSWORD_LENGTH) {
        throw new WeakPasswordError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
    }
    return bcrypt.hash(password, SALT_ROUNDS);
}
export async function verifyPassword(password, hash) {
    return bcrypt.compare(password, hash);
}
// A real bcrypt hash of an unguessable fixed password, used to run
// bcrypt.compare against when a login email doesn't exist — so "no such
// account" and "wrong password" take roughly the same amount of time.
// Precomputed once (not generated at module load — hashSync at import time
// would block every cold start for ~100ms+ for no benefit). Not a complete
// defence against user-enumeration timing attacks (query time still
// varies), but removes the most obvious signal.
export const DUMMY_HASH_FOR_TIMING_SAFETY = '$2b$12$cC0uDECJaTF/RT/SQILOpuQfm16G5cOe1wd8LL.wFPC3nXiPUx/ne';
