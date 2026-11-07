/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

// Add Workspace scopes for full integration
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/gmail.send');
provider.addScope('https://www.googleapis.com/auth/gmail.readonly');

/**
 * ฟังก์ชันสำหรับเรียกใช้งานเมื่อกดปุ่ม ล็อกอินด้วย Google ผ่าน Firebase Authentication
 */
export async function loginWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log('User Info:', user);

    // บันทึกข้อมูลลง LocalStorage เพื่อใช้งานในแอป
    const userProfile = {
      name: user.displayName || 'Siripoom Ngokkam',
      email: user.email || 'siriphum212550@gmail.com',
      picture: user.photoURL || '/assets/aistudio/student_avatar.png'
    };
    localStorage.setItem('user', JSON.stringify(userProfile));

    alert(`ยินดีต้อนรับคุณ ${user.displayName || userProfile.name}`);
    return user;
  } catch (error: any) {
    console.error('Login Error:', error.message);
    throw error;
  }
}

/**
 * ออกจากระบบ Google
 */
export async function logoutFromGoogle(): Promise<void> {
  await signOut(auth);
  localStorage.removeItem('user');
}

/**
 * ฟังก์ชันย่อยสำหรับดึงและถอดรหัสข้อมูลจาก Google Identity Services JWT Token
 */
export function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error('JWT Parse error:', err);
    return null;
  }
}
