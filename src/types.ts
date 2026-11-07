/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  nameEn?: string; // English subtitle e.g. "Signature Herbal Grass Jelly Drink"
  category: string; // 'classic' | 'honey' | 'deluxe' | 'new' | 'promo'
  categoryTag: string; // e.g. 'สูตรดั้งเดิม', 'น้ำผึ้งป่าเดือนห้า', 'ทรงเครื่อง 6 สหาย'
  priceNormal: number;
  priceSpecial: number;
  originalPriceNormal?: number;
  originalPriceSpecial?: number;
  rating: number;
  reviewCount: number;
  badge: string; // e.g. 'ธรรมดา / พิเศษ', 'ชาม 500g'
  description: string;
  image: string;
  inStock: boolean;
  isBestSeller?: boolean;
  isNew?: boolean;
}

export interface Topping {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  cartItemId: string;
  productId: string;
  name: string;
  nameEn?: string;
  image: string;
  sizeType: 'ธรรมดา' | 'พิเศษ';
  sweetness: string; // 'หวานปกติ 100%', 'หวานกลมกล่อม 50%', etc.
  toppings: Topping[];
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  note?: string;
}

export type OrderStatus = 'รอตรวจสอบ' | 'กำลังจัดเตรียม' | 'กำลังจัดส่ง' | 'สำเร็จ' | 'ยกเลิก';

export interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  gpsLink: string; // Google Maps GPS Link
  location?: string;
  kkuZone?: string;
  note?: string;
}

export interface Order {
  id: string;
  createdAt: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  customer: CustomerInfo;
  paymentMethod: 'promptpay' | 'cash';
  slipImage?: string;
  receiptSentToEmail?: boolean;
  receiptSentAt?: string;
}

export interface StoreConfig {
  storeName: string;
  storeLogo?: string; // Store profile photo / logo (DataURL or URL)
  isOpen: boolean;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  promptPayId: string;
  promptPayName: string;
  promptPayQrImage?: string; // Custom uploaded QR code image (DataURL or URL)
  adminPin: string;
}

export interface GoogleUserProfile {
  id: string;
  name: string;
  email: string;
  picture: string;
  isLoggedIn: boolean;
  loginMethod: 'google' | 'guest';
}
