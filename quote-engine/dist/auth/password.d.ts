export declare const MIN_PASSWORD_LENGTH = 12;
export declare class WeakPasswordError extends Error {
    constructor(message: string);
}
export declare function hashPassword(password: string): Promise<string>;
export declare function verifyPassword(password: string, hash: string): Promise<boolean>;
export declare const DUMMY_HASH_FOR_TIMING_SAFETY = "$2b$12$cC0uDECJaTF/RT/SQILOpuQfm16G5cOe1wd8LL.wFPC3nXiPUx/ne";
