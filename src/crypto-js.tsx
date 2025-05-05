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
const dbPromise = openDB('my-database', 2, {
  upgrade(db, oldVersion, newVersion) {
    if (oldVersion < 1) {
      if (!db.objectStoreNames.contains('emotions')) {
        db.createObjectStore('emotions', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('chat')) {
        db.createObjectStore('chat', { keyPath: 'id', autoIncrement: true });
      }
    }
    if (oldVersion < 2) {
      if (!db.objectStoreNames.contains('usedShareKeys')) {
        const shareKeysStore = db.createObjectStore('usedShareKeys', { keyPath: 'key' });
        shareKeysStore.createIndex('used', 'used');
        shareKeysStore.createIndex('usedAt', 'usedAt');
      }
    }
  },
});

// Emotionen speichern mit Deduplizierung und Datenpflege
const saveEmotion = async (emotionData: EmotionData) => {
  const db = await dbPromise;
  
  // Check for duplicate entries within the last hour
  const tx = db.transaction('emotions', 'readwrite');
  const allEntries = await tx.store.getAll();
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  const recentEntries = allEntries
    .map(entry => decryptData(entry.data))
    .filter(entry => entry && new Date(entry.date) > oneHourAgo);

  const isDuplicate = recentEntries.some(entry =>
    entry.emotion === emotionData.emotion &&
    entry.strength === emotionData.strength &&
    entry.reason === emotionData.reason
  );

  if (isDuplicate) {
    console.log('Similar emotion entry already exists within the last hour');
    return;
  }

  // Clean up old entries (keep last 100 entries)
  const sortedEntries = allEntries.sort((a, b) => {
    const dateA = decryptData(a.data)?.date;
    const dateB = decryptData(b.data)?.date;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  if (sortedEntries.length >= 100) {
    for (const entry of sortedEntries.slice(100)) {
      await tx.store.delete(entry.id);
    }
  }

  // Save new emotion
  const encryptedData = encryptData(emotionData);
  await tx.store.add({ data: encryptedData });
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

const deleteEmotion = async (deleteItem: EmotionData) => {
  const db = await dbPromise;
  const tx = db.transaction("emotions", "readwrite");
  const allEntries = await tx.store.getAll();
  
  // Finde den Eintrag, der gelöscht werden soll
  const entryToDelete = allEntries.find(entry => {
    const decryptedData = decryptData(entry.data);
    return decryptedData &&
           decryptedData.date === deleteItem.date &&
           decryptedData.emotion === deleteItem.emotion &&
           decryptedData.reason === deleteItem.reason;
  });

  // Wenn der Eintrag gefunden wurde, lösche ihn
  if (entryToDelete) {
    await tx.store.delete(entryToDelete.id);
    await tx.done;
    return true;
  }

  await tx.done;
  return false;
}

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

// Share key management functions
const saveShareKey = async (shareKey: string) => {
  const db = await dbPromise;
  const tx = db.transaction('usedShareKeys', 'readwrite');
  await tx.store.put({
    key: shareKey,
    used: false,
    usedAt: null
  });
  await tx.done;
};

const markShareKeyAsUsed = async (shareKey: string) => {
  const db = await dbPromise;
  const tx = db.transaction('usedShareKeys', 'readwrite');
  await tx.store.put({
    key: shareKey,
    used: true,
    usedAt: new Date()
  });
  await tx.done;
};

const verifyShareKey = async (shareKey: string) => {
  const db = await dbPromise;
  const tx = db.transaction('usedShareKeys', 'readonly');
  const keyData = await tx.store.get(shareKey);
  await tx.done;
  
  if (!keyData) {
    throw new Error('Share key not found');
  }
  if (keyData.used) {
    throw new Error('Share key has already been used');
  }
  return true;
};

interface ProfileData {
  name: "example",
  age: 0,
  email: "example",
  ProfilePic: 0,
};

const saveProfileData = async (profileData:ProfileData)=>{
    const db = await 
}

export { 
  saveEmotion, 
  loadEmotions, 
  saveChatMessage, 
  loadChatMessages, 
  decryptData,
  saveShareKey,
  markShareKeyAsUsed,
  verifyShareKey,
  deleteEmotion
};

