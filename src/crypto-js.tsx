import CryptoJS from 'crypto-js';
import { openDB } from 'idb';

// Verwende einen Schlüssel, aber verstecke diesen am besten
const encryptionKey = import.meta.env.VITE_PUBLIC_Encryption_Key;

// Funktion zum Verschlüsseln von Daten
const encryptData = (data: any) => {
  const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), encryptionKey).toString();
  return ciphertext;
};

// Funktion zum Entschlüsseln von Daten
const decryptData = (ciphertext: string) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, encryptionKey);
  const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  return decryptedData;
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
const saveEmotion = async (emotionData: any) => {
    const db = await dbPromise;
    const encryptedData = encryptData(emotionData);
    const tx = db.transaction('emotions', 'readwrite');
    tx.store.add({data: encryptedData});
    await tx.done;
};

// Emotionen lesen
const loadEmotions = async () => {
    const db = await dbPromise;
    const tx = db.transaction('emotions', 'readonly');
    const encryptedEmotions = await tx.store.getAll();
    const decryptedEmotions = encryptedEmotions.map((entry) => decryptData(entry.data));
    return decryptedEmotions;
};

// Chat Nachrichten speichern
const saveChatMessage = async (chatMessage: any) => {
    const db = await dbPromise;
    const encryptedData = encryptData(chatMessage);
    const tx = db.transaction('chat', 'readwrite');
    tx.store.add({data: encryptedData});
    await tx.done;
};

// Chat Nachrichten laden
const loadChatMessages = async () => {
    const db = await dbPromise;
    const tx = db.transaction('chat', 'readonly');
    const encryptedMessages = await tx.store.getAll();
    const decryptedMessages = encryptedMessages.map((entry) => decryptData(entry.data));
    return decryptedMessages;
}

export {saveEmotion, loadEmotions, saveChatMessage, loadChatMessages};
