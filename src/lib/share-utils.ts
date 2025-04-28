import { db } from '@/helpers/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

// Generate a random password
export function generatePassword(length: number = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
}

// Send share email with password
export async function sendShareEmail(email: string, password: string): Promise<void> {
  try {
    // Store the share request in Firestore
    const shareCollection = collection(db, 'shares');
    await addDoc(shareCollection, {
      email,
      password,
      createdAt: new Date(),
      status: 'pending'
    });

    // Note: In a production environment, you would typically:
    // 1. Use a secure email service (SendGrid, AWS SES, etc.)
    // 2. Set up a serverless function to handle the email sending
    // 3. Implement proper email templates
    // For demo purposes, we're just storing the share request in Firestore
  } catch (error) {
    console.error('Error sending share email:', error);
    throw error;
  }
}