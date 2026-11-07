/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getAccessToken } from './googleSheets';
import { Order } from '../types';

/**
 * Creates a raw base64url-encoded RFC 2822 MIME message supporting UTF-8 Thai text
 */
function createMimeMessage(to: string, subject: string, htmlBody: string): string {
  // UTF-8 Subject in Base64: =?utf-8?B?...?=
  const encodedSubject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;

  const messageLines = [
    `To: ${to}`,
    `Subject: ${encodedSubject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    'Content-Transfer-Encoding: base64',
    '',
    btoa(unescape(encodeURIComponent(htmlBody)))
  ];

  const fullMessage = messageLines.join('\r\n');

  // Convert standard base64 to base64url format
  return btoa(unescape(encodeURIComponent(fullMessage)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Generates official HTML E-Receipt email template for ChaoKuay KKU
 */
export function generateReceiptHtml(order: Order): string {
  const itemsHtml = order.items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #f0e6dc;">
        <td style="padding: 10px 0;">
          <div style="font-weight: bold; color: #2B1810; font-size: 14px;">${item.name}</div>
          <div style="font-size: 12px; color: #7A695E;">ขนาด: ${item.sizeType} · ความหวาน: ${item.sweetness}</div>
          ${
            item.toppings && item.toppings.length > 0
              ? `<div style="font-size: 11px; color: #8C5226;">ท็อปปิ้ง: ${item.toppings.map((t) => t.name).join(', ')}</div>`
              : ''
          }
        </td>
        <td style="padding: 10px 0; text-align: center; color: #523E33; font-size: 13px;">x${item.quantity}</td>
        <td style="padding: 10px 0; text-align: right; font-weight: bold; color: #2B1810; font-size: 14px;">฿${item.totalPrice}</td>
      </tr>
    `
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>ใบเสร็จรับเงินอิเล็กทรอนิกส์ #${order.id}</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #FAF7F2; font-family: 'Prompt', 'Sarabun', Arial, sans-serif; color: #2B1810;">
  <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; border: 1px solid #EFE8DE; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    
    <!-- Header Banner -->
    <div style="background-color: #2E1A11; padding: 24px; text-align: center; color: #ffffff;">
      <div style="font-size: 28px; margin-bottom: 6px;">🍯</div>
      <h1 style="margin: 0; font-size: 20px; font-weight: 800; color: #E5A850;">ร้านน้ำเฉาก๊วย KKU (CHAOKUAY)</h1>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #D1B8A5;">เฉาก๊วยสมุนไพรแท้ มหาวิทยาลัยขอนแก่น</p>
      <div style="display: inline-block; background-color: rgba(229, 168, 80, 0.2); border: 1px solid rgba(229, 168, 80, 0.4); padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: bold; color: #E5A850; margin-top: 12px;">
        ใบเสร็จรับเงินอิเล็กทรอนิกส์ (E-Receipt)
      </div>
    </div>

    <!-- Order Info -->
    <div style="padding: 20px 24px; background-color: #FAF8F5; border-bottom: 1px solid #EFE8DE;">
      <table style="width: 100%; font-size: 13px;">
        <tr>
          <td style="color: #7A695E;">หมายเลขคำสั่งซื้อ:</td>
          <td style="text-align: right; font-weight: bold; font-family: monospace; color: #2B1810;">#${order.id}</td>
        </tr>
        <tr>
          <td style="color: #7A695E;">วัน-เวลาที่สั่ง:</td>
          <td style="text-align: right; color: #2B1810;">${order.createdAt}</td>
        </tr>
        <tr>
          <td style="color: #7A695E;">ชื่อลูกค้า:</td>
          <td style="text-align: right; font-weight: bold; color: #2B1810;">${order.customer.name}</td>
        </tr>
        <tr>
          <td style="color: #7A695E;">เบอร์โทรศัพท์:</td>
          <td style="text-align: right; color: #2B1810;">${order.customer.phone}</td>
        </tr>
        <tr>
          <td style="color: #7A695E;">จุดจัดส่ง (มข.):</td>
          <td style="text-align: right; color: #2B1810;">${order.customer.location}</td>
        </tr>
        <tr>
          <td style="color: #7A695E;">วิธีการชำระเงิน:</td>
          <td style="text-align: right; font-weight: bold; color: #C97A32;">${order.paymentMethod === 'promptpay' ? 'พร้อมเพย์ QR' : 'เงินสด'}</td>
        </tr>
      </table>
    </div>

    <!-- Items List -->
    <div style="padding: 20px 24px;">
      <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: bold; color: #2B1810;">รายการเครื่องดื่ม</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="border-bottom: 2px solid #EFE8DE; color: #7A695E; font-size: 12px; text-align: left;">
            <th style="padding-bottom: 8px;">เมนู</th>
            <th style="padding-bottom: 8px; text-align: center;">จำนวน</th>
            <th style="padding-bottom: 8px; text-align: right;">ราคา</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <!-- Summary -->
      <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid #EFE8DE;">
        <table style="width: 100%; font-size: 13px; line-height: 1.8;">
          <tr>
            <td style="color: #7A695E;">ยอดรวมสินค้า:</td>
            <td style="text-align: right; font-weight: bold; color: #2B1810;">฿${order.subtotal}</td>
          </tr>
          <tr>
            <td style="color: #7A695E;">ค่าจัดส่งรอบ มข.:</td>
            <td style="text-align: right; color: ${order.deliveryFee === 0 ? '#16a34a' : '#2B1810'}; font-weight: bold;">
              ${order.deliveryFee === 0 ? 'ส่งฟรี' : `฿${order.deliveryFee}`}
            </td>
          </tr>
          <tr style="font-size: 16px; border-top: 2px solid #2B1810; padding-top: 8px;">
            <td style="padding-top: 8px; font-weight: 800; color: #2B1810;">ยอดสุทธิ:</td>
            <td style="padding-top: 8px; text-align: right; font-weight: 800; color: #C97A32;">฿${order.total} บาท</td>
          </tr>
        </table>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #FAF5ED; padding: 16px 24px; text-align: center; border-top: 1px solid #EFE8DE; font-size: 12px; color: #7A695E;">
      <p style="margin: 0 0 4px 0; font-weight: bold; color: #2B1810;">ขอขอบพระคุณที่อุดหนุน ร้านน้ำเฉาก๊วย KKU</p>
      <p style="margin: 0; font-size: 11px;">เครื่องดื่มเฉาก๊วยสมุนไพรแท้ 100% ต้มเคี่ยวกว่า 8 ชั่วโมง สดใหม่ทุกวัน</p>
      <p style="margin: 6px 0 0 0; font-size: 10px; color: #A89587;">อีเมลนี้สร้างและจัดส่งอัตโนมัติผ่าน Google Workspace Gmail API</p>
    </div>

  </div>
</body>
</html>
  `;
}

/**
 * Sends a real E-Receipt email directly through Gmail API
 */
export async function sendEmailViaGmail(
  to: string,
  order: Order
): Promise<{ id: string; success: boolean }> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('กรุณาเข้าสู่ระบบ Google เพื่อส่งอีเมลผ่าน Gmail API');
  }

  const subject = `ใบเสร็จรับเงินคำสั่งซื้อ #${order.id} - ร้านน้ำเฉาก๊วย KKU (CHAOKUAY)`;
  const htmlBody = generateReceiptHtml(order);

  // Construct raw base64url message
  const rawMessage = createMimeMessage(to, subject, htmlBody);

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      raw: rawMessage
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ส่งอีเมลผ่าน Gmail API ไม่สำเร็จ: ${errorText}`);
  }

  const data = await response.json();
  return {
    id: data.id,
    success: true
  };
}

/**
 * Retrieves the authenticated user's Gmail profile
 */
export async function getGmailProfile(): Promise<{ emailAddress: string; messagesTotal: number } | null> {
  const token = await getAccessToken();
  if (!token) return null;

  try {
    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('Get Gmail profile error:', err);
    return null;
  }
}
