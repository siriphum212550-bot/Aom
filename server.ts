/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3000', 10);
const DB_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DB_DIR, 'store_db.json');

// Default initial data if database file does not exist
const INITIAL_PRODUCTS = [
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

const DEFAULT_STORE_CONFIG = {
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

const INITIAL_ORDERS = [
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

// Helper to ensure database directory & file exist
function getDb() {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initialDb = {
        products: INITIAL_PRODUCTS,
        storeConfig: DEFAULT_STORE_CONFIG,
        orders: INITIAL_ORDERS,
        updatedAt: new Date().toISOString()
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
      return initialDb;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading store database:', err);
    return {
      products: INITIAL_PRODUCTS,
      storeConfig: DEFAULT_STORE_CONFIG,
      orders: INITIAL_ORDERS,
      updatedAt: new Date().toISOString()
    };
  }
}

function saveDb(data: any) {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    data.updatedAt = new Date().toISOString();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing store database:', err);
  }
}

async function startServer() {
  const app = express();

  // Support up to 25MB for uploaded PromptPay QR images and receipts
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // ==================== REST API Endpoints ====================

  // 1. Get complete store data (products, config, orders) - Persists across all visitors
  app.get('/api/store-data', (_req: Request, res: Response) => {
    const db = getDb();
    res.json({
      success: true,
      products: db.products || INITIAL_PRODUCTS,
      storeConfig: db.storeConfig || DEFAULT_STORE_CONFIG,
      orders: db.orders || INITIAL_ORDERS,
      updatedAt: db.updatedAt
    });
  });

  // 2. Save complete store data
  app.post('/api/store-data', (req: Request, res: Response) => {
    const { products, storeConfig, orders } = req.body;
    const current = getDb();

    if (products) current.products = products;
    if (storeConfig) current.storeConfig = storeConfig;
    if (orders) current.orders = orders;

    saveDb(current);
    res.json({ success: true, message: 'Store data saved permanently on server', updatedAt: current.updatedAt });
  });

  // 3. Save or update products
  app.post('/api/products', (req: Request, res: Response) => {
    const { products, product } = req.body;
    const current = getDb();

    if (Array.isArray(products)) {
      current.products = products;
    } else if (product) {
      const idx = current.products.findIndex((p: any) => p.id === product.id);
      if (idx >= 0) {
        current.products[idx] = product;
      } else {
        current.products.unshift(product);
      }
    }

    saveDb(current);
    res.json({ success: true, products: current.products });
  });

  // 4. Delete product
  app.delete('/api/products/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const current = getDb();
    current.products = (current.products || []).filter((p: any) => p.id !== id);
    saveDb(current);
    res.json({ success: true, products: current.products });
  });

  // 5. Update store configuration (PromptPay QR, Delivery fee, Shop name, Admin PIN)
  app.post('/api/config', (req: Request, res: Response) => {
    const newConfig = req.body;
    const current = getDb();
    current.storeConfig = {
      ...(current.storeConfig || DEFAULT_STORE_CONFIG),
      ...newConfig
    };
    saveDb(current);
    res.json({ success: true, storeConfig: current.storeConfig });
  });

  // 6. Customer creates a new order
  app.post('/api/orders', (req: Request, res: Response) => {
    const newOrder = req.body;
    if (!newOrder || !newOrder.id) {
      res.status(400).json({ success: false, error: 'Invalid order data' });
      return;
    }
    const current = getDb();
    current.orders = [newOrder, ...(current.orders || [])];
    saveDb(current);
    res.json({ success: true, order: newOrder, ordersCount: current.orders.length });
  });

  // 7. Update order status or receipt status
  app.put('/api/orders/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body;
    const current = getDb();
    current.orders = (current.orders || []).map((o: any) =>
      o.id === id ? { ...o, ...updates } : o
    );
    saveDb(current);
    res.json({ success: true, orders: current.orders });
  });

  // 8. Delete order
  app.delete('/api/orders/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const current = getDb();
    current.orders = (current.orders || []).filter((o: any) => o.id !== id);
    saveDb(current);
    res.json({ success: true, orders: current.orders });
  });

  // Helper to generate UTF-8 BOM CSV matching Google Sheets & Excel
  function generateOrdersCsv(orders: any[]): string {
    const header = [
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

    const rows = (orders || []).map((o: any) => {
      const itemsDescription = (o.items || [])
        .map((i: any) => `${i.name} [${i.sizeType || 'ธรรมดา'}] (${i.sweetness || 'หวานปกติ 100%'}) x${i.quantity}`)
        .join(', ');

      return [
        o.id,
        `"${o.createdAt}"`,
        `"${(o.customer?.name || '').replace(/"/g, '""')}"`,
        `"${o.customer?.phone || ''}"`,
        `"${o.customer?.email || ''}"`,
        `"${(o.customer?.location || o.customer?.gpsLink || '').replace(/"/g, '""')}"`,
        `"${o.customer?.kkuZone || 'มข.'}"`,
        `"${itemsDescription.replace(/"/g, '""')}"`,
        o.total,
        `"${o.paymentMethod === 'promptpay' ? 'พร้อมเพย์ QR' : 'เงินสด'}"`,
        `"${o.status}"`,
        `"${o.receiptSentToEmail ? 'ส่งใบเสร็จแล้ว' : 'ยังไม่ส่ง'}"`
      ].join(',');
    });

    return '\uFEFF' + [header.join(','), ...rows].join('\r\n');
  }

  // 10. Real-time Excel / CSV export endpoint for Google Sheets & Excel
  app.get('/api/orders.csv', (_req: Request, res: Response) => {
    const db = getDb();
    const csvContent = generateOrdersCsv(db.orders || []);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="ChaoKuay_KKU_Orders_Realtime.csv"');
    res.send(csvContent);
  });

  // 11. Real-time JSON feed of all orders for spreadsheets and integrations
  app.get('/api/orders', (_req: Request, res: Response) => {
    const db = getDb();
    res.json({ success: true, orders: db.orders || [] });
  });

  // ==================== Vite Integration ====================
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
    app.use('*', async (req: Request, res: Response, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ChaoKuay KKU Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
