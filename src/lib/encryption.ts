// Using Web Crypto API for better security and browser compatibility
export class ClientEncryption {
  private static async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );
    
    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }
  
  static async encrypt(plaintext: string, userPassword: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);
    
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const key = await this.deriveKey(userPassword, salt);
    
    const encryptedData = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      data
    );
    
    // Combine salt + iv + encrypted data
    const result = new Uint8Array(salt.length + iv.length + encryptedData.byteLength);
    result.set(salt, 0);
    result.set(iv, salt.length);
    result.set(new Uint8Array(encryptedData), salt.length + iv.length);
    
    return btoa(String.fromCharCode(...result));
  }
  
  static async decrypt(encryptedData: string, userPassword: string): Promise<string> {
    const data = new Uint8Array(atob(encryptedData).split('').map(c => c.charCodeAt(0)));
    
    const salt = data.slice(0, 16);
    const iv = data.slice(16, 28);
    const encrypted = data.slice(28);
    
    const key = await this.deriveKey(userPassword, salt);
    
    const decryptedData = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encrypted
    );
    
    return new TextDecoder().decode(decryptedData);
  }
}

