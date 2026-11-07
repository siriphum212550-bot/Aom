/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, Topping, Order, StoreConfig, GoogleUserProfile } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'ck-1',
    name: 'น้ำเฉาก๊วยสูตรดั้งเดิมใบชาโบราณ',
    nameEn: 'Signature Herbal Grass Jelly Drink',
    category: 'classic',
    categoryTag: 'สูตรดั้งเดิม',
    priceNormal: 55,
    priceSpecial: 65,
    originalPriceNormal: 65,
    originalPriceSpecial: 75,
    rating: 4.9,
    reviewCount: 128,
    badge: 'ธรรมดา / พิเศษ',
    description: 'น้ำเฉาก๊วยต้มสดจากใบเฉาก๊วยแท้ 100% หอมกลิ่นใบชาโบราณ หวานละมุนจากน้ำตาลอ้อยธรรมชาติ เสิร์ฟพร้อมเนื้อเฉาก๊วยหนึบหนับ',
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&q=80&w=700',
    inStock: true,
    isBestSeller: true
  },
  {
    id: 'ck-2',
    name: 'น้ำเฉาก๊วยผสมน้ำผึ้งป่าแท้ & นมสดฮอกไกโด',
    nameEn: 'Honey & Fresh Milk Grass Jelly Latte',
    category: 'honey',
    categoryTag: 'น้ำผึ้งป่าเดือนห้า',
    priceNormal: 89,
    priceSpecial: 99,
    originalPriceNormal: 110,
    originalPriceSpecial: 120,
    rating: 4.95,
    reviewCount: 215,
    badge: 'ธรรมดา / พิเศษ',
    description: 'ความลงตัวของน้ำผึ้งป่าเดือนห้าแท้ ผสานนมสดฮอกไกโดเข้มข้น และเนื้อเฉาก๊วยเคี้ยวเพลิน หอมมัน ละมุนลิ้น',
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&q=80&w=700',
    inStock: true,
    isBestSeller: true
  },
  {
    id: 'ck-3',
    name: 'เฉาก๊วยทรงเครื่องจักรพรรดิ ชามดินเผา',
    nameEn: 'Royal Loaded Chao Kuay Dessert Bowl',
    category: 'deluxe',
    categoryTag: 'ทรงเครื่อง 6 สหาย',
    priceNormal: 150,
    priceSpecial: 180,
    originalPriceNormal: 180,
    originalPriceSpecial: 210,
    rating: 4.88,
    reviewCount: 94,
    badge: 'ชาม 500g',
    description: 'เฉาก๊วยแท้ตัดเต๋าเหนียวนุ่มพิเศษ จัดเต็มเครื่อง 6 ชนิด: แปะก๊วยต้มน้ำตาล, ถั่วแดงหลวง, เม็ดบัวเชื่อม, พุทราจีน, รากบัวเชื่อม, และวุ้นมะพร้าว',
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=700',
    inStock: true,
    isBestSeller: true
  },
  {
    id: 'ck-4',
    name: 'น้ำเฉาก๊วยชาไทยครีมชีสพ่นไฟ',
    nameEn: 'Thai Tea Cream Cheese Grass Jelly',
    category: 'new',
    categoryTag: 'ชาไทยพ่นไฟ',
    priceNormal: 95,
    priceSpecial: 105,
    originalPriceNormal: 120,
    originalPriceSpecial: 130,
    rating: 4.97,
    reviewCount: 310,
    badge: 'ธรรมดา / พิเศษ',
    description: 'ชาไทยปักษ์ใต้ต้มเข้มข้น ท็อปด้วยครีมชีสสูตรพิเศษพ่นไฟหอมกรุ่น เข้ากันได้ดีกับเนื้อเฉาก๊วยนุ่มหนึบ',
    image: 'https://images.unsplash.com/photo-1558857563-b371033873b8?auto=format&fit=crop&q=80&w=700',
    inStock: true,
    isNew: true
  },
  {
    id: 'ck-5',
    name: 'เฉาก๊วยมะพร้าวอ่อนน้ำหอม & วุ้นใบเตย',
    nameEn: 'Aromatic Coconut & Pandan Chao Kuay',
    category: 'new',
    categoryTag: 'มะพร้าวอ่อน',
    priceNormal: 79,
    priceSpecial: 89,
    originalPriceNormal: 95,
    originalPriceSpecial: 105,
    rating: 4.92,
    reviewCount: 167,
    badge: 'ถ้วย 350g',
    description: 'น้ำมะพร้าวน้ำหอมแท้พร้อมเนื้อมะพร้าวอ่อน ผสานวุ้นใบเตยสดหอมละมุนและเฉาก๊วยชิ้นโต ชื่นใจดับกระหาย',
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=700',
    inStock: true,
    isNew: true
  },
  {
    id: 'ck-6',
    name: 'น้ำเฉาก๊วยลำไยสีทองเนื้อกรอบ',
    nameEn: 'Golden Longan Herbal Grass Jelly Drink',
    category: 'new',
    categoryTag: 'ลำไยสีทอง',
    priceNormal: 69,
    priceSpecial: 79,
    originalPriceNormal: 85,
    originalPriceSpecial: 95,
    rating: 4.85,
    reviewCount: 89,
    badge: 'ธรรมดา / พิเศษ',
    description: 'น้ำลำไยสีทองอบแห้งเกรดเอ รสชาติหวานหอมธรรมชาติ พร้อมเนื้อลำไยเน้นๆ และเฉาก๊วยหนึบหนับ',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=700',
    inStock: true,
    isNew: true
  },
  {
    id: 'ck-7',
    name: 'น้ำเฉาก๊วยสูตรน้ำผึ้งมะนาวป่าโซดา',
    nameEn: 'Sparkling Wild Honey Lime Grass Jelly',
    category: 'honey',
    categoryTag: 'น้ำผึ้งมะนาวโซดา',
    priceNormal: 75,
    priceSpecial: 85,
    originalPriceNormal: undefined,
    originalPriceSpecial: undefined,
    rating: 4.91,
    reviewCount: 142,
    badge: 'ธรรมดา / พิเศษ',
    description: 'สดชื่นซาบซ่าด้วยน้ำผึ้งป่าเดือนห้าคั้นสดผสมมะนาวแท้และโซดา ท็อปปิ้งเฉาก๊วยเคี้ยวเพลิน',
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=700',
    inStock: true
  },
  {
    id: 'ck-8',
    name: 'ชุดของฝากเฉาก๊วยพรีเมียม (กล่อง 4 ถ้วย + น้ำตาลอ้อย)',
    nameEn: 'Premium Chao Kuay Gift Box (Set of 4)',
    category: 'promo',
    categoryTag: 'ชุดของฝาก',
    priceNormal: 199,
    priceSpecial: 240,
    originalPriceNormal: 240,
    originalPriceSpecial: 280,
    rating: 4.94,
    reviewCount: 204,
    badge: 'เซ็ต 4 ถ้วย',
    description: 'เซ็ตของฝากยอดนิยม บรรจุเฉาก๊วย 4 ถ้วย พร้อมน้ำตาลอ้อยธรรมชาติและน้ำเชื่อมสูตรโบราณ บรรจุในกล่องสวยงาม',
    image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&q=80&w=700',
    inStock: true
  }
];

export const AVAILABLE_TOPPINGS: Topping[] = [
  { id: 'top-reg', name: 'เฉาก๊วยธรรมดา', price: 0 },
  { id: 'top-spec', name: 'เฉาก๊วยพิเศษ', price: 15 },
  { id: 'top-chewy', name: 'เนื้อเฉาก๊วยหนึบหนับพิเศษ', price: 15 },
  { id: 'top-lotus', name: 'เม็ดบัวเชื่อมโบราณ', price: 10 },
  { id: 'top-redbean', name: 'ถั่วแดงหลวงต้มสุก', price: 10 }
];

export const SWEETNESS_LEVELS = [
  'หวาน 0%',
  'หวานน้อย 25%',
  'หวานกลมกล่อม 50%',
  'หวานปกติ 100%'
];

export const KKU_CAMPUS_ZONES = [
  'หอพักนักศึกษา (หอ 8 หลัง / หอ 9 หลัง / หอชาย-หญิง)',
  'คณะวิศวกรรมศาสตร์ มข.',
  'ศูนย์อาหารและบริการ (คอมเพล็กซ์ มข.)',
  'สำนักหอสมุดกลาง มข.',
  'โรงพยาบาลศรีนครินทร์ (ศูนย์การแพทย์)',
  'คณะแพทยศาสตร์ / พยาบาลศาสตร์',
  'คณะมนุษยศาสตร์และสังคมศาสตร์',
  'คณะวิทยาศาสตร์ มข.',
  'คณะบริหารธุรกิจและการบัญชี (KKBS)',
  'คณะเกษตรศาสตร์ / เทคโนโลยี',
  'อุทยานวิทยาศาสตร์ มข. (Science Park)'
];

export const DEFAULT_STORE_CONFIG: StoreConfig = {
  storeName: 'ร้านน้ำเฉาก๊วย KKU (CHAOKUAY)',
  storeLogo: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&q=80&w=200',
  isOpen: true,
  deliveryFee: 35,
  freeDeliveryThreshold: 50,
  promptPayId: '0812345678',
  promptPayName: 'ร้านเฉาก๊วยสมุนไพรแท้ มหาวิทยาลัยขอนแก่น',
  promptPayQrImage: 'https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=00020101021129370016A000000677010111011300668123456785802TH530376463046C4C',
  adminPin: '1234'
};

export const DEFAULT_GOOGLE_USER: GoogleUserProfile = {
  id: 'google-user-siriphum',
  name: 'Siripoom Ngokkam',
  email: 'siriphum212550@gmail.com',
  picture: '/assets/aistudio/student_avatar.png',
  isLoggedIn: true,
  loginMethod: 'google'
};

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'CK-932181',
    createdAt: '3/11/2569 15:18:52',
    items: [
      {
        cartItemId: 'ck-3-excel-1',
        productId: 'ck-3',
        name: 'เฉาก๊วยทรงเครื่องจักรพรรดิ ชามดินเผา',
        nameEn: 'Royal Loaded Chao Kuay Dessert Bowl',
        image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=700',
        sizeType: 'ธรรมดา',
        sweetness: 'หวานกลมกล่อม 50%',
        toppings: [
          { id: 'top-spec', name: 'เฉาก๊วยพิเศษ', price: 15 }
        ],
        unitPrice: 185,
        quantity: 1,
        totalPrice: 185,
        note: 'ขอช้อนเพิ่ม 2 คันครับ'
      }
    ],
    subtotal: 185,
    deliveryFee: 0,
    total: 185,
    status: 'กำลังจัดเตรียม',
    customer: {
      name: 'Siripoom Ngokkam',
      phone: '081-234-5678',
      email: 'siriphum212550@gmail.com',
      gpsLink: 'https://maps.google.com/?q=16.4744,102.8231',
      location: '99/4 หมู่ 2 ถนนมิตรภาพ ต.ในเมือง อ.เมือง จ.ขอนแก่น 40000',
      kkuZone: 'มหาวิทยาลัยขอนแก่น (ถนนมิตรภาพ)',
      note: 'จัดส่งที่ป้อม รปภ. ด้านหน้า'
    },
    paymentMethod: 'cash',
    receiptSentToEmail: true,
    receiptSentAt: '3/11/2569 15:19:10'
  },
  {
    id: 'CK-779703',
    createdAt: '3/11/2569 21:39:39',
    items: [
      {
        cartItemId: 'ck-2-excel-2',
        productId: 'ck-2',
        name: 'น้ำเฉาก๊วยผสมน้ำผึ้งป่าแท้ & นมสดฮอกไกโด',
        nameEn: 'Honey & Fresh Milk Grass Jelly Latte',
        image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&q=80&w=700',
        sizeType: 'ธรรมดา',
        sweetness: 'หวานปกติ 100%',
        toppings: [],
        unitPrice: 65,
        quantity: 1,
        totalPrice: 65,
        note: 'แยกน้ำแข็งครับ'
      }
    ],
    subtotal: 65,
    deliveryFee: 0,
    total: 65,
    status: 'กำลังจัดเตรียม',
    customer: {
      name: 'Siripoom Ngokkam',
      phone: '081-234-5678',
      email: 'siriphum212550@gmail.com',
      gpsLink: 'https://maps.google.com/?q=16.4762,102.8258',
      location: '99/4 หมู่ 2 ถนนมิตรภาพ ต.ในเมือง อ.เมือง จ.ขอนแก่น 40000',
      kkuZone: 'มหาวิทยาลัยขอนแก่น (ถนนมิตรภาพ)',
      note: 'โทรแจ้งเมื่อถึง'
    },
    paymentMethod: 'cash',
    receiptSentToEmail: true,
    receiptSentAt: '3/11/2569 21:40:02'
  },
  {
    id: 'CK-253099',
    createdAt: '4/11/2569 16:24:13',
    items: [
      {
        cartItemId: 'ck-1-excel-3',
        productId: 'ck-1',
        name: 'น้ำเฉาก๊วยสูตรดั้งเดิมใบชาโบราณ',
        nameEn: 'Signature Herbal Grass Jelly Drink',
        image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&q=80&w=700',
        sizeType: 'ธรรมดา',
        sweetness: 'หวานปกติ 100%',
        toppings: [],
        unitPrice: 55,
        quantity: 1,
        totalPrice: 55,
        note: 'ขอหลอดใหญ่'
      }
    ],
    subtotal: 55,
    deliveryFee: 0,
    total: 55,
    status: 'กำลังจัดเตรียม',
    customer: {
      name: 'Siripoom Ngokkam',
      phone: '081-234-5678',
      email: 'siriphum212550@gmail.com',
      gpsLink: 'https://maps.google.com/?q=16.4728,102.8219',
      location: '99/4 หมู่ 2 ถนนมิตรภาพ ต.ในเมือง อ.เมือง จ.ขอนแก่น 40000',
      kkuZone: 'มหาวิทยาลัยขอนแก่น (ถนนมิตรภาพ)',
      note: 'โอนผ่านพร้อมเพย์เรียบร้อยแล้ว'
    },
    paymentMethod: 'promptpay',
    receiptSentToEmail: true,
    receiptSentAt: '4/11/2569 16:24:45'
  }
];

export const STORAGE_KEYS = {
  PRODUCTS: 'kku_chaokuay_products_v6',
  ORDERS: 'kku_chaokuay_orders_v6',
  STORE_CONFIG: 'kku_chaokuay_config_v6',
  CART: 'kku_chaokuay_cart_v6',
  WISHLIST: 'kku_chaokuay_wishlist_v6',
  ADMIN_AUTH: 'kku_chaokuay_admin_auth_v6',
  GOOGLE_USER: 'kku_chaokuay_google_user_v6'
};

export function loadData<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`Error loading key "${key}":`, err);
    return defaultValue;
  }
}

export function saveData<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving key "${key}":`, err);
  }
}
