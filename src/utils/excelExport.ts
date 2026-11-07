/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Order } from '../types';

export function exportOrdersToExcel(orders: Order[], filenamePrefix = 'ChaoKuay_KKU_Orders_GoogleSheets') {
  const xlsxLib = (window as any).XLSX;

  const data = orders.map((o) => {
    const itemsDescription = o.items
      .map((i) => `${i.name} [${i.sizeType || 'ธรรมดา'}] (${i.sweetness || 'หวานปกติ 100%'}) x${i.quantity}`)
      .join(', ');

    return {
      'รหัสคำสั่งซื้อ (Order ID)': o.id,
      'วัน-เวลา (Date Time)': o.createdAt,
      'ชื่อลูกค้า (Customer Name)': o.customer.name,
      'เบอร์โทรศัพท์ (Phone)': o.customer.phone,
      'อีเมลลูกค้า (Email)': o.customer.email || 'siriphum212550@gmail.com',
      'สถานที่จัดส่ง (KKU Campus)': o.customer.location || '',
      'โซน มข.': o.customer.kkuZone || 'มข.',
      'ลิงก์พิกัด GPS (Google Maps)': o.customer.gpsLink || '',
      'รายการสินค้าที่สั่ง (Items)': itemsDescription,
      'ยอดรวมสุทธิ (Total THB)': o.total,
      'วิธีการชำระเงิน (Payment Method)': o.paymentMethod === 'promptpay' ? 'พร้อมเพย์ QR' : 'เงินสด',
      'สถานะคำสั่งซื้อ (Status)': o.status,
      'สถานะใบเสร็จ (E-Receipt)': o.receiptSentToEmail ? 'ส่งใบเสร็จแล้ว' : 'ยังไม่ส่ง'
    };
  });

  if (xlsxLib && xlsxLib.utils) {
    try {
      const worksheet = xlsxLib.utils.json_to_sheet(data);
      const workbook = xlsxLib.utils.book_new();
      xlsxLib.utils.book_append_sheet(workbook, worksheet, 'Orders');
      xlsxLib.writeFile(workbook, `${filenamePrefix}_${Date.now()}.xlsx`);
      return true;
    } catch (err) {
      console.warn('SheetJS error, falling back to CSV:', err);
    }
  }

  // Fallback to UTF-8 BOM CSV for Excel
  const headers = [
    'รหัสคำสั่งซื้อ (Order ID)',
    'วัน-เวลา (Date Time)',
    'ชื่อลูกค้า (Customer Name)',
    'เบอร์โทรศัพท์ (Phone)',
    'อีเมลลูกค้า (Email)',
    'สถานที่จัดส่ง (KKU Campus)',
    'โซน มข.',
    'ลิงก์พิกัด GPS (Google Maps)',
    'รายการสินค้าที่สั่ง (Items)',
    'ยอดรวมสุทธิ (Total THB)',
    'วิธีการชำระเงิน (Payment Method)',
    'สถานะคำสั่งซื้อ (Status)',
    'สถานะใบเสร็จ (E-Receipt)'
  ];

  const rows = data.map((d) => [
    `"${d['รหัสคำสั่งซื้อ (Order ID)']}"`,
    `"${d['วัน-เวลา (Date Time)']}"`,
    `"${(d['ชื่อลูกค้า (Customer Name)'] || '').replace(/"/g, '""')}"`,
    `"${d['เบอร์โทรศัพท์ (Phone)'] || ''}"`,
    `"${d['อีเมลลูกค้า (Email)'] || ''}"`,
    `"${(d['สถานที่จัดส่ง (KKU Campus)'] || '').replace(/"/g, '""')}"`,
    `"${d['โซน มข.'] || 'มข.'}"`,
    `"${d['ลิงก์พิกัด GPS (Google Maps)'] || ''}"`,
    `"${d['รายการสินค้าที่สั่ง (Items)'].replace(/"/g, '""')}"`,
    d['ยอดรวมสุทธิ (Total THB)'],
    `"${d['วิธีการชำระเงิน (Payment Method)']}"`,
    `"${d['สถานะคำสั่งซื้อ (Status)']}"`,
    `"${d['สถานะใบเสร็จ (E-Receipt)']}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filenamePrefix}_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
}
