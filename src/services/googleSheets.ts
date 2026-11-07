/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Order } from '../types';

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Provider with Workspace scopes (Drive, Sheets, Gmail)
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/gmail.send');
provider.addScope('https://www.googleapis.com/auth/gmail.readonly');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

// Initialize auth state listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Token not in memory yet, will be acquired on sign-in
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Firebase Auth');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign In error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logoutGoogle = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

// ==================== Google Sheets API Methods ====================

export interface SpreadsheetInfo {
  id: string;
  title: string;
  url: string;
}

/**
 * Creates a brand new Google Spreadsheet in the user's Google Drive
 */
export async function createOrdersSpreadsheet(
  title = 'ร้านน้ำเฉาก๊วย KKU - บันทึกคำสั่งซื้อ (Orders)'
): Promise<SpreadsheetInfo> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('กรุณาเข้าสู่ระบบ Google เพื่อเชื่อมต่อ Google Sheets');
  }

  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: {
        title
      },
      sheets: [
        {
          properties: {
            title: 'Orders',
            gridProperties: {
              frozenRowCount: 1
            }
          }
        }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`สร้าง Google Sheets ไม่สำเร็จ: ${errorText}`);
  }

  const data = await response.json();
  const spreadsheetId = data.spreadsheetId;
  const url = data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  return {
    id: spreadsheetId,
    title,
    url
  };
}

/**
 * Syncs orders into the Google Spreadsheet
 */
export async function syncOrdersToSpreadsheet(
  spreadsheetId: string,
  orders: Order[]
): Promise<boolean> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('กรุณาเข้าสู่ระบบ Google เพื่อซิงก์ข้อมูล');
  }

  const headerRow = [
    'รหัสคำสั่งซื้อ (Order ID)',
    'วัน-เวลา (Date Time)',
    'ชื่อลูกค้า (Customer Name)',
    'เบอร์โทรศัพท์ (Phone)',
    'อีเมลลูกค้า (Email)',
    'สถานที่จัดส่ง (KKU Campus)',
    'โซน มข.',
    'รายการสินค้าที่สั่ง (Items)',
    'ยอดรวมสุทธิ (Total THB)',
    'วิธีการชำระเงิน (Payment Method)',
    'สถานะคำสั่งซื้อ (Status)',
    'สถานะใบเสร็จ (E-Receipt)'
  ];

  const dataRows = orders.map((o) => {
    const itemsDescription = o.items
      .map((i) => `${i.name} [${i.sizeType}] (${i.sweetness}) x${i.quantity}`)
      .join(', ');

    return [
      o.id,
      o.createdAt,
      o.customer.name,
      o.customer.phone,
      o.customer.email || 'siriphum212550@gmail.com',
      o.customer.location,
      o.customer.kkuZone || 'มข.',
      itemsDescription,
      o.total,
      o.paymentMethod === 'promptpay' ? 'พร้อมเพย์ QR' : 'เงินสด',
      o.status,
      o.receiptSentToEmail ? 'ส่งใบเสร็จแล้ว' : 'ยังไม่ส่ง'
    ];
  });

  const allValues = [headerRow, ...dataRows];

  // Write all rows into Orders sheet
  const updateResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:L${allValues.length}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        range: `A1:L${allValues.length}`,
        majorDimension: 'ROWS',
        values: allValues
      })
    }
  );

  if (!updateResponse.ok) {
    const errorText = await updateResponse.text();
    throw new Error(`ซิงก์ข้อมูลลง Google Sheets ไม่สำเร็จ: ${errorText}`);
  }

    return true;
}

/**
 * Appends a single new order row to Google Sheets in real-time
 */
export async function appendOrderToSpreadsheet(
  spreadsheetId: string,
  order: Order
): Promise<boolean> {
  const token = await getAccessToken();
  if (!token) return false;

  const itemsDescription = order.items
    .map((i) => `${i.name} [${i.sizeType}] (${i.sweetness}) x${i.quantity}`)
    .join(', ');

  const row = [
    order.id,
    order.createdAt,
    order.customer.name,
    order.customer.phone,
    order.customer.email || 'siriphum212550@gmail.com',
    order.customer.location || order.customer.gpsLink || '',
    order.customer.kkuZone || 'มข.',
    itemsDescription,
    order.total,
    order.paymentMethod === 'promptpay' ? 'พร้อมเพย์ QR' : 'เงินสด',
    order.status,
    order.receiptSentToEmail ? 'ส่งใบเสร็จแล้ว' : 'ยังไม่ส่ง'
  ];

  try {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Orders!A:L:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          range: 'Orders!A:L',
          majorDimension: 'ROWS',
          values: [row]
        })
      }
    );
    return res.ok;
  } catch (err) {
    console.warn('Real-time Google Sheets append error:', err);
    return false;
  }
}

/**
 * Searches for existing spreadsheets in user's Google Drive
 */
export async function listSpreadsheets(): Promise<SpreadsheetInfo[]> {
  const token = await getAccessToken();
  if (!token) return [];

  try {
    const q = encodeURIComponent("mimeType='application/vnd.google-apps.spreadsheet' and trashed=false");
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,webViewLink)&pageSize=10`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (!response.ok) return [];
    const data = await response.json();
    return (data.files || []).map((f: any) => ({
      id: f.id,
      title: f.name,
      url: f.webViewLink || `https://docs.google.com/spreadsheets/d/${f.id}/edit`
    }));
  } catch (err) {
    console.warn('Error listing spreadsheets:', err);
    return [];
  }
}
