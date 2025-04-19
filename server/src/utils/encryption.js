const crypto = require('crypto');

// Helper to generate a random key for each algorithm
function generateKey(algorithm) {
  switch (algorithm) {
    case 'aes':
      return crypto.randomBytes(32); // AES-256
    case 'des':
      return crypto.randomBytes(8); // DES
    case '3des':
      return crypto.randomBytes(24); // TripleDES
    case 'rc4':
      return crypto.randomBytes(16); // RC4
    case 'blowfish':
      return crypto.randomBytes(16); // Blowfish (Node.js does not support natively)
    case 'rsa':
      // For RSA, generate a keypair (not just a key)
      return crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
    default:
      throw new Error('Unsupported algorithm');
  }
}

// Encrypt text with the given algorithm and key
function encryptText(algorithm, text, keyObj) {
  switch (algorithm) {
    case 'aes': {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-cbc', keyObj, iv);
      let encrypted = cipher.update(text, 'utf8', 'base64');
      encrypted += cipher.final('base64');
      return { ciphertext: encrypted, iv: iv.toString('base64'), key: keyObj.toString('base64') };
    }
    case 'des': {
      const iv = crypto.randomBytes(8);
      const cipher = crypto.createCipheriv('des-cbc', keyObj, iv);
      let encrypted = cipher.update(text, 'utf8', 'base64');
      encrypted += cipher.final('base64');
      return { ciphertext: encrypted, iv: iv.toString('base64'), key: keyObj.toString('base64') };
    }
    case '3des': {
      const iv = crypto.randomBytes(8);
      const cipher = crypto.createCipheriv('des-ede3-cbc', keyObj, iv);
      let encrypted = cipher.update(text, 'utf8', 'base64');
      encrypted += cipher.final('base64');
      return { ciphertext: encrypted, iv: iv.toString('base64'), key: keyObj.toString('base64') };
    }
    case 'rc4': {
      const cipher = crypto.createCipheriv('rc4', keyObj, null);
      let encrypted = cipher.update(text, 'utf8', 'base64');
      encrypted += cipher.final('base64');
      return { ciphertext: encrypted, iv: '', key: keyObj.toString('base64') };
    }
    case 'rsa': {
      const { publicKey } = keyObj;
      const encrypted = crypto.publicEncrypt(publicKey, Buffer.from(text, 'utf8')).toString('base64');
      return { ciphertext: encrypted, iv: '', key: publicKey.export({ type: 'pkcs1', format: 'pem' }) };
    }
    default:
      throw new Error('Unsupported algorithm');
  }
}

// Decrypt ciphertext with the given algorithm and key
function decryptText(algorithm, ciphertext, keyObj, iv = null) {
  switch (algorithm) {
    case 'aes': {
      const decipher = crypto.createDecipheriv('aes-256-cbc', keyObj, Buffer.from(iv, 'base64'));
      let decrypted = decipher.update(ciphertext, 'base64', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    }
    case 'des': {
      const decipher = crypto.createDecipheriv('des-cbc', keyObj, Buffer.from(iv, 'base64'));
      let decrypted = decipher.update(ciphertext, 'base64', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    }
    case '3des': {
      const decipher = crypto.createDecipheriv('des-ede3-cbc', keyObj, Buffer.from(iv, 'base64'));
      let decrypted = decipher.update(ciphertext, 'base64', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    }
    case 'rc4': {
      const decipher = crypto.createDecipheriv('rc4', keyObj, null);
      let decrypted = decipher.update(ciphertext, 'base64', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    }
    case 'rsa': {
      const { privateKey } = keyObj;
      const decrypted = crypto.privateDecrypt(privateKey, Buffer.from(ciphertext, 'base64')).toString('utf8');
      return decrypted;
    }
    default:
      throw new Error('Unsupported algorithm');
  }
}

module.exports = { generateKey, encryptText, decryptText };
