import crypto from 'crypto'

export const encrypt = (buffer) => {
    try {
        const algorithm = process.env.ALGORITHM;
        const key = Buffer.from(process.env.KEY, 'hex');
        const iv = crypto.randomBytes(16);  // Generate a random IV for each encryption

        if (key.length !== 32) {
            throw new Error('Invalid key length. Expected 32 bytes for aes-256-cbc.');
        }

        const cipher = crypto.createCipheriv(algorithm, key, iv);
        const encrypted = Buffer.concat([iv, cipher.update(buffer), cipher.final()]);

        return encrypted;
    } catch (error) {
        console.error('Encryption error:', error.message);
        throw error;
    }
};



export const decrypt = (encrypted) => {
    try {
        const algorithm = process.env.ALGORITHM;
        const key = Buffer.from(process.env.KEY, 'hex');
        const iv = encrypted.slice(0, 16); // Extract the IV from the encrypted data
        const data = encrypted.slice(16); // The rest is the encrypted data

        if (key.length !== 32) {
            throw new Error('Invalid key length. Expected 32 bytes for aes-256-cbc.');
        }

        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);

        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error.message);
        throw error;
    }
};
