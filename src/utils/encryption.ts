// src/utils/encryption.ts

class Encryption {
    private static encryptionKey: string | null = null;

    /**
     * Initialize encryption with a secret key
     * @param secretKey - Secret key for encryption/decryption
     */
    static initialize(secretKey: string) {
        if (!secretKey || secretKey.length < 16) {
            throw new Error('Secret key must be at least 16 characters long');
        }
        this.encryptionKey = secretKey;
    }

    /**
     * Get the current encryption key or throw error if not initialized
     */
    private static getKey(): string {
        if (!this.encryptionKey) {
            throw new Error('Encryption not initialized. Call Encryption.initialize(secretKey) first');
        }
        return this.encryptionKey;
    }

    /**
     * Simple XOR encryption/decryption
     * @param text - Text to encrypt/decrypt
     * @returns Encrypted/Decrypted text
     */
    private static xorEncrypt(text: string): string {
        const key = this.getKey();
        let result = '';
        for (let i = 0; i < text.length; i++) {
            const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
            result += String.fromCharCode(charCode);
        }
        return result;
    }

    /**
     * Convert string to base64
     * @param str - String to convert
     * @returns Base64 string
     */
    private static toBase64(str: string): string {
        try {
            return btoa(str);
        } catch (e) {
            // Handle non-ASCII characters
            return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
                (match, p1) => String.fromCharCode(parseInt(p1, 16))));
        }
    }

    /**
     * Convert base64 to string
     * @param str - Base64 string to convert
     * @returns Decoded string
     */
    private static fromBase64(str: string): string {
        try {
            return atob(str);
        } catch (e) {
            // Handle non-ASCII characters
            return decodeURIComponent(Array.prototype.map.call(atob(str), c =>
                '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            ).join(''));
        }
    }

    /**
     * Encrypt data
     * @param data - Data to encrypt
     * @returns Encrypted string
     */
    static encrypt(data: any): string {
        const jsonString = JSON.stringify(data);
        const encrypted = this.xorEncrypt(jsonString);
        return this.toBase64(encrypted);
    }

    /**
     * Decrypt data
     * @param encryptedData - Data to decrypt
     * @returns Decrypted data
     */
    static decrypt(encryptedData: string): any {
        try {
            const decoded = this.fromBase64(encryptedData);
            const decrypted = this.xorEncrypt(decoded);
            return JSON.parse(decrypted);
        } catch (error) {
            throw new Error('Failed to decrypt data');
        }
    }

    /**
     * Reset encryption key (useful for testing or key rotation)
     */
    static reset() {
        this.encryptionKey = null;
    }
}

export default Encryption;