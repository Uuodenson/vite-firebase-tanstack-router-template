import CryptoJS from 'crypto-js';
import { openDB } from 'idb';
import { EmotionData } from './routes/emotions.lazy';

// Verwende einen Schlüssel, aber verstecke diesen am besten
const encryptionKey = import.meta.env.VITE_ENCRYPTION_KEY;

// Konfiguration für die Verschlüsselung
const cfg = {
  mode: CryptoJS.mode.CBC,
  padding: CryptoJS.pad.Pkcs7
};

// Funktion zum Verschlüsseln von Daten
const encryptData = (data: any, customKey: string = 'share') => {
  const key = encryptionKey || customKey;
  if (!key) {
    throw new Error('Encryption key is not properly initialized');
  }
  const jsonString = JSON.stringify(data);
  return CryptoJS.AES.encrypt(jsonString, key, cfg).toString();
};

// Funktion zum Entschlüsseln von Daten
const decryptData = (encryptedBase64: string, customKey: string = 'share') => {
  if (!encryptedBase64 || typeof encryptedBase64 !== 'string') {
    console.error('Invalid encrypted data format');
    return null;
  }

  const key = encryptionKey || customKey;
  if (!key) {
    console.error('Encryption key not initialized');
    return null;
  }

  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedBase64, key, cfg);
    if (decrypted) {
      const str = decrypted.toString(CryptoJS.enc.Utf8);
      if (str.length > 0) {
        return JSON.parse(str);
      }
    }
    return null;
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

// IndexedDB öffnen/erstellen
const dbPromise = openDB('my-database', 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('emotions')) {
      db.createObjectStore('emotions', { keyPath: 'id', autoIncrement: true });
    }
    if (!db.objectStoreNames.contains('chat')) {
      db.createObjectStore('chat', { keyPath: 'id', autoIncrement: true });
    }
  },
});

// Emotionen speichern
const saveEmotion = async (emotionData: EmotionData) => {
  const db = await dbPromise;
  const encryptedData = encryptData(emotionData);
  alert(encryptedData)
  const tx = db.transaction('emotions', 'readwrite');
  tx.store.add({ data: encryptedData });
  await tx.done;
};

// Emotionen lesen
const loadEmotions = async () => {
  const db = await dbPromise;
  const tx = db.transaction('emotions', 'readonly');
  const encryptedEmotions = await tx.store.getAll();
  const decryptedEmotions = encryptedEmotions
    .map((entry) => decryptData(entry.data))
    .filter((entry) => entry !== null);

  return decryptedEmotions;
};

// Chat Nachrichten speichern
const saveChatMessage = async (chatMessage: any) => {
  const db = await dbPromise;
  const encryptedData = encryptData(chatMessage);
  const tx = db.transaction('chat', 'readwrite');
  tx.store.add({ data: encryptedData });
  await tx.done;
};

// Chat Nachrichten laden
const loadChatMessages = async () => {
  const db = await dbPromise;
  const tx = db.transaction('chat', 'readonly');
  const encryptedMessages = await tx.store.getAll()
  const decryptedMessages = encryptedMessages
    .map((entry) => decryptData(entry.data))
    .filter((entry) => entry !== null);
  return decryptedMessages;
}

export { saveEmotion, loadEmotions, saveChatMessage, loadChatMessages, decryptData };

