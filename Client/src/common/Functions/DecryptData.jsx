// import CryptoJS from 'crypto-js';

// const ENCRYPTION_KEY = import.meta.env.VITE_REACT_APP_API_ENCRYPTION_KEY;

// export const decryptData = (encryptedData) => {
//     try {
//         const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
//         const decrypted = bytes.toString(CryptoJS.enc.Utf8);
//         return JSON.parse(decrypted);
//     } catch (error) {
//         console.error('Decryption error:', error);
//         return null;
//     }
// };

import CryptoJS from "crypto-js";

const ENCRYPTION_KEY = import.meta.env.VITE_REACT_APP_API_ENCRYPTION_KEY;

export const decryptData = (encrypted) => {
  try {
    if (!encrypted) return null;

    const cleanEncrypted = encrypted.replace(/^"|"$/g, "");

    const key = CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY);
    const iv = CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY.substring(0, 16));

    // IMPORTANT: wrap base64 string correctly:
    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: CryptoJS.enc.Base64.parse(cleanEncrypted) },
      key,
      {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    );

    const text = decrypted.toString(CryptoJS.enc.Utf8);
    return text ? JSON.parse(text) : null;
  } catch (err) {
    console.error("Decryption error:", err);
    return null;
  }
};
