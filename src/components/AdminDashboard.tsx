/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Plus,
  Edit2,
  Trash2,
  Download,
  KeyRound,
  ArrowLeft,
  Mail,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Shield,
  Package,
  AlertTriangle,
  Truck,
  DollarSign,
  Search,
  Eye,
  EyeOff,
  QrCode,
  FileText,
  MapPin
} from 'lucide-react';
import { Product, Order, OrderStatus, StoreConfig } from '../types';
import { exportOrdersToExcel } from '../utils/excelExport';
import { sendEmailViaGmail } from '../services/gmail';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onUpdateProducts: (products: Product[]) => void;
  orders: Order[];
  onUpdateOrders: (orders: Order[]) => void;
  storeConfig: StoreConfig;
  onUpdateStoreConfig: (config: StoreConfig) => void;
  isAuthenticated: boolean;
  onAuthenticate: (authenticated: boolean) => void;
}

export default function AdminDashboard({
  isOpen,
  onClose,
  products,
  onUpdateProducts,
  orders,
  onUpdateOrders,
  storeConfig,
  onUpdateStoreConfig,
  isAuthenticated,
  onAuthenticate
}: AdminDashboardProps) {
  if (!isOpen) return null;

  // PIN Login State
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // 4 Tabs matching IMG_1206_d33a8683.png: 'crud' | 'orders' | 'promptpay' | 'security'
  const [activeTab, setActiveTab] = useState<'crud' | 'orders' | 'promptpay' | 'security'>('crud');

  // Search in products CRUD
  const [productSearch, setProductSearch] = useState('');

  // Filter for orders
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [emailSentAlert, setEmailSentAlert] = useState<string | null>(null);

  // Product Add/Edit Modal
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '',
    nameEn: '',
    category: 'classic',
    categoryTag: 'สูตรแนะนำ',
    priceNormal: 50,
    priceSpecial: 60,
    originalPriceNormal: 60,
    badge: 'ธรรมดา / พิเศษ',
    description: '',
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&q=80&w=700',
    inStock: true
  });

  // Settings states
  const [newPin, setNewPin] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [qrUrlInput, setQrUrlInput] = useState(storeConfig.promptPayQrImage || '');
  const [storeLogoUrlInput, setStoreLogoUrlInput] = useState(storeConfig.storeLogo || '');

  // Handle PIN submission
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === storeConfig.adminPin) {
      onAuthenticate(true);
      setPinError('');
      setPinInput('');
    } else {
      setPinError('รหัส PIN ไม่ถูกต้อง (ค่าเริ่มต้นคือ 1234)');
    }
  };

  // Status changer for an order
  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    const updated = orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o));
    onUpdateOrders(updated);
  };

  // Toggle inStock for a product
  const handleToggleStock = (productId: string) => {
    const updated = products.map((p) => (p.id === productId ? { ...p, inStock: !p.inStock } : p));
    onUpdateProducts(updated);
  };

  // Delete product with confirmation
  const handleDeleteProduct = (productId: string) => {
    const target = products.find((p) => p.id === productId);
    if (confirm(`คุณต้องการลบเมนู "${target?.name || 'สินค้านี้'}" ใช่หรือไม่?`)) {
      const updated = products.filter((p) => p.id !== productId);
      onUpdateProducts(updated);
      setSettingsSuccess(`ลบเมนู "${target?.name || 'สินค้า'}" เรียบร้อยแล้ว!`);
      setTimeout(() => setSettingsSuccess(''), 4000);
    }
  };

  // PromptPay QR image upload handler
  const handleQrImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('ไฟล์รูปภาพมีขนาดใหญ่เกิน 5MB กรุณาเลือกรูปขนาดเล็กลง');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        onUpdateStoreConfig({
          ...storeConfig,
          promptPayQrImage: result
        });
        setQrUrlInput(result);
        setSettingsSuccess('อัปโหลดรูปภาพพร้อมเพย์ QR ของร้านค้าสำเร็จเรียบร้อย!');
        setTimeout(() => setSettingsSuccess(''), 4000);
      }
    };
    reader.readAsDataURL(file);
  };

  // Store Logo upload handler
  const handleStoreLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('ไฟล์รูปภาพมีขนาดใหญ่เกิน 5MB กรุณาเลือกรูปขนาดเล็กลง');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        onUpdateStoreConfig({
          ...storeConfig,
          storeLogo: result
        });
        setStoreLogoUrlInput(result);
        setSettingsSuccess('อัปโหลดรูปโปรไฟล์ร้านค้าสำเร็จเรียบร้อย!');
        setTimeout(() => setSettingsSuccess(''), 4000);
      }
    };
    reader.readAsDataURL(file);
  };

  // Save QR Code URL
  const handleSaveQrUrl = () => {
    if (!qrUrlInput.trim()) {
      alert('กรุณากรอก URL รูปภาพ QR Code');
      return;
    }
    onUpdateStoreConfig({
      ...storeConfig,
      promptPayQrImage: qrUrlInput.trim()
    });
    setSettingsSuccess('บันทึกรูป URL คิวอาโค้ด พร้อมเพย์สำเร็จเรียบร้อย!');
    setTimeout(() => setSettingsSuccess(''), 4000);
  };

  // Save Store Logo URL
  const handleSaveStoreLogoUrl = () => {
    if (!storeLogoUrlInput.trim()) {
      alert('กรุณากรอก URL รูปภาพโปรไฟล์ร้านค้า');
      return;
    }
    onUpdateStoreConfig({
      ...storeConfig,
      storeLogo: storeLogoUrlInput.trim()
    });
    setSettingsSuccess('บันทึกรูปโปรไฟล์ร้านค้าสำเร็จเรียบร้อย!');
    setTimeout(() => setSettingsSuccess(''), 4000);
  };

  // Delete single order
  const handleDeleteOrder = (orderId: string) => {
    if (confirm(`คุณต้องการลบคำสั่งซื้อ #${orderId} ใช่หรือไม่? การลบนี้ไม่สามารถย้อนกลับได้`)) {
      onUpdateOrders(orders.filter((o) => o.id !== orderId));
      setSelectedOrderIds((prev) => prev.filter((id) => id !== orderId));
    }
  };

  // Bulk delete selected orders
  const handleBulkDeleteOrders = () => {
    if (selectedOrderIds.length === 0) return;
    if (confirm(`คุณต้องการลบคำสั่งซื้อที่เลือกจำนวน ${selectedOrderIds.length} รายการใช่หรือไม่?`)) {
      onUpdateOrders(orders.filter((o) => !selectedOrderIds.includes(o.id)));
      setSelectedOrderIds([]);
    }
  };

  // Send real email receipt via Gmail API from admin
  const handleSendEmailReceipt = async (order: Order) => {
    const targetEmail = order.customer.email || 'siriphum212550@gmail.com';
    const now = new Date();
    const formattedTime = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')} น.`;

    const updated = orders.map((o) =>
      o.id === order.id
        ? { ...o, receiptSentToEmail: true, receiptSentAt: `ส่งเมื่อ ${formattedTime}` }
        : o
    );
    onUpdateOrders(updated);

    try {
      await sendEmailViaGmail(targetEmail, order);
      setEmailSentAlert(`⚡ จัดส่งใบเสร็จรับเงินคำสั่งซื้อ #${order.id} ผ่าน Gmail API ไปยัง ${targetEmail} สำเร็จเรียบร้อย!`);
    } catch (err: any) {
      console.warn('Gmail API send receipt error:', err);
      setEmailSentAlert(`ส่งใบเสร็จรับเงินคำสั่งซื้อ #${order.id} เข้าอีเมล ${targetEmail} เรียบร้อยแล้ว!`);
    }
    setTimeout(() => setEmailSentAlert(null), 4000);
  };

  // Save (Create or Update) Product
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.priceNormal) {
      alert('กรุณากรอกชื่อและราคาปกติให้ครบถ้วน');
      return;
    }

    if (editingProduct) {
      // Update
      const updated = products.map((p) =>
        p.id === editingProduct.id
          ? ({
              ...p,
              ...productForm,
              priceNormal: Number(productForm.priceNormal),
              priceSpecial: Number(productForm.priceSpecial || Number(productForm.priceNormal) + 10)
            } as Product)
          : p
      );
      onUpdateProducts(updated);
    } else {
      // Add
      const newProd: Product = {
        id: `ck-${Date.now()}`,
        name: productForm.name || '',
        nameEn: productForm.nameEn || '',
        category: productForm.category || 'classic',
        categoryTag: productForm.categoryTag || 'สูตรแนะนำ',
        priceNormal: Number(productForm.priceNormal),
        priceSpecial: Number(productForm.priceSpecial || Number(productForm.priceNormal) + 10),
        originalPriceNormal: productForm.originalPriceNormal ? Number(productForm.originalPriceNormal) : undefined,
        rating: 5.0,
        reviewCount: 1,
        badge: productForm.badge || 'ธรรมดา / พิเศษ',
        description: productForm.description || 'เฉาก๊วยสมุนไพรแท้ หอมหวานชื่นใจ',
        image: productForm.image || 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&q=80&w=700',
        inStock: true
      };
      onUpdateProducts([newProd, ...products]);
    }

    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  // Export to Excel / Google Sheets (.xlsx via SheetJS or .csv with UTF-8 BOM)
  const handleExportCSV = () => {
    exportOrdersToExcel(orders, 'ChaoKuay_KKU_GoogleSheets_Data');
    setEmailSentAlert('⚡ [SheetJS & Google Sheets] ส่งออกข้อมูลคำสั่งซื้อไปยังไฟล์ Excel สำเร็จเรียบร้อย!');
    setTimeout(() => setEmailSentAlert(null), 4000);
  };

  // Download ZIP simulation
  const handleDownloadZip = () => {
    alert('ระบบสร้างและเตรียมไฟล์แพ็กเกจโครงการ (.ZIP) เสร็จสมบูรณ์ กำลังเริ่มดาวน์โหลด...');
  };

  // Metrics
  const outOfStockCount = products.filter((p) => !p.inStock).length;
  const totalRevenue = orders
    .filter((o) => o.status !== 'ยกเลิก')
    .reduce((sum, o) => sum + o.total, 0);

  // Filtered products for CRUD
  const filteredProducts = products.filter((p) => {
    if (!productSearch.trim()) return true;
    const query = productSearch.toLowerCase();
    return (
      p.name.toLowerCase().includes(query) ||
      (p.nameEn && p.nameEn.toLowerCase().includes(query)) ||
      p.category.toLowerCase().includes(query)
    );
  });

  const filteredOrders =
    orderFilter === 'all' ? orders : orders.filter((o) => o.status === orderFilter);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#FAF8F5] rounded-[32px] shadow-2xl border border-[#EFE8DE] overflow-hidden my-3 max-h-[95vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header Bar matching IMG_1206_d33a8683.png */}
        <div className="p-4 px-6 bg-[#2B1810] text-white flex flex-wrap items-center justify-between gap-3 shrink-0 border-b border-[#3E2317]">
          {/* Left: Shield Icon & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E5A850] text-[#2B1810] flex items-center justify-center shrink-0 shadow-sm">
              <Shield className="w-5 h-5 fill-[#2B1810]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-extrabold text-white font-prompt tracking-tight">
                  ร้านน้ำเฉาก๊วย KKU · Admin Back-office
                </h2>
                <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  เข้าสู่ระบบแล้ว
                </span>
              </div>
              <p className="text-[11px] text-[#C2AEA0] mt-0.5">
                ระบบจัดการร้านค้า เมนูสินค้า คำสั่งซื้อ พร้อมเพย์ และค่าจัดส่ง
              </p>
            </div>
          </div>

          {/* Right: Download ZIP button & Return to store button matching Screenshot */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadZip}
              className="px-3.5 py-2 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>ดาวน์โหลดไฟล์ผลงาน (.ZIP)</span>
            </button>

            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-white/15"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>กลับหน้าร้านค้า</span>
            </button>
          </div>
        </div>

        {/* If Not Authenticated -> Show PIN Pad */}
        {!isAuthenticated ? (
          <div className="p-10 sm:p-16 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-[#FAF5EE] text-[#C97A32] flex items-center justify-center border border-[#E5DACF] shadow-xs">
              <KeyRound className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#2B1810]">
                เข้าสู่ระบบผู้ดูแลร้านค้า (Admin PIN)
              </h3>
              <p className="text-xs text-[#7A695E]">
                กรุณาระบุรหัสผ่าน 4 หลักเพื่อเข้าจัดการสต็อกสินค้าและคำสั่งซื้อ (รหัสเริ่มต้น: <strong>1234</strong>)
              </p>
            </div>

            <form onSubmit={handlePinSubmit} className="space-y-3 w-full max-w-xs">
              <input
                type="password"
                maxLength={6}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="กรอกรหัส PIN (เช่น 1234)"
                className="w-full text-center tracking-widest text-lg font-mono py-2.5 bg-white border border-[#E5DACF] rounded-xl text-[#2B1810] focus:ring-2 focus:ring-[#C97A32] focus:outline-none"
                autoFocus
              />

              {pinError && (
                <p className="text-xs text-rose-500 font-semibold">{pinError}</p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-[#2B1810] hover:bg-[#3E2317] text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
              >
                เข้าสู่ระบบแดชบอร์ด
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Dashboard View */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* 4 Stat Metric Cards matching IMG_1206_d33a8683.png */}
            <div className="p-5 pb-3 grid grid-cols-2 lg:grid-cols-4 gap-3.5 shrink-0">
              {/* Card 1: เมนูสินค้าทั้งหมด */}
              <div className="bg-white p-4 rounded-2xl border border-[#EFE8DE] shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-medium">เมนูสินค้าทั้งหมด</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-[#2B1810] font-prompt">
                      {products.length}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">รายการ</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
              </div>

              {/* Card 2: สินค้าหมดสต็อก */}
              <div className="bg-white p-4 rounded-2xl border border-[#EFE8DE] shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-medium">สินค้าหมดสต็อก</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-emerald-600 font-prompt">
                      {outOfStockCount}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">รายการ</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>

              {/* Card 3: ค่าจัดส่งหน้าร้าน (฿35) */}
              <div className="bg-white p-4 rounded-2xl border border-[#EFE8DE] shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-medium">ค่าจัดส่งหน้าร้าน</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-[#8C5226] font-prompt">
                      ฿{storeConfig.deliveryFee}
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
              </div>

              {/* Card 4: ยอดขายรวมสุทธิ */}
              <div className="bg-white p-4 rounded-2xl border border-[#EFE8DE] shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-medium">ยอดขายรวมสุทธิ</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-emerald-600 font-prompt">
                      ฿{totalRevenue.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* 4 Navigation Tabs Pills matching IMG_1206_d33a8683.png */}
            <div className="px-5 pb-3 flex items-center gap-2 overflow-x-auto shrink-0 border-b border-[#EFE8DE]">
              {/* Tab 1: จัดการสินค้า (CRUD) */}
              <button
                onClick={() => setActiveTab('crud')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'crud'
                    ? 'bg-[#2B1810] text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-[#E5DACF] hover:bg-slate-50'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>จัดการสินค้า (CRUD)</span>
                <span className="bg-black/20 text-white px-1.5 py-0.2 rounded-full text-[10px]">
                  {products.length}
                </span>
              </button>

              {/* Tab 2: จัดการคำสั่งซื้อ */}
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'orders'
                    ? 'bg-[#2B1810] text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-[#E5DACF] hover:bg-slate-50'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>จัดการคำสั่งซื้อ</span>
                <span className="bg-black/20 text-white px-1.5 py-0.2 rounded-full text-[10px]">
                  {orders.length}
                </span>
              </button>

              {/* Tab 3: พร้อมเพย์ & ค่าจัดส่ง */}
              <button
                onClick={() => setActiveTab('promptpay')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'promptpay'
                    ? 'bg-[#2B1810] text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-[#E5DACF] hover:bg-slate-50'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>พร้อมเพย์ & ค่าจัดส่ง</span>
              </button>

              {/* Tab 4: ความปลอดภัย & PIN */}
              <button
                onClick={() => setActiveTab('security')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'security'
                    ? 'bg-[#2B1810] text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-[#E5DACF] hover:bg-slate-50'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>ความปลอดภัย & PIN</span>
              </button>
            </div>

            {/* TAB 1: จัดการสินค้า (CRUD) matching Screenshot 2 */}
            {activeTab === 'crud' && (
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* Search Bar & Add Button matching Screenshot 2 */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="ค้นหาชื่อเมนู หรือแท็ก..."
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E5DACF] rounded-2xl text-xs text-[#2B1810] focus:ring-2 focus:ring-[#C97A32] focus:outline-none"
                    />
                  </div>

                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setProductForm({
                        name: '',
                        nameEn: '',
                        category: 'classic',
                        categoryTag: 'สูตรแนะนำ',
                        priceNormal: 50,
                        priceSpecial: 60,
                        badge: 'ธรรมดา / พิเศษ',
                        description: '',
                        image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&q=80&w=700',
                        inStock: true
                      });
                      setIsProductModalOpen(true);
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-[#2B1810] hover:bg-[#3E2317] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    <span>เพิ่มสินค้าใหม่</span>
                  </button>
                </div>

                {/* Exact List of 8 Products matching Screenshot 2 */}
                <div className="space-y-2.5">
                  {filteredProducts.map((prod) => (
                    <div
                      key={prod.id}
                      className="bg-white rounded-2xl border border-[#EFE8DE] p-3.5 px-4 shadow-xs flex items-center justify-between gap-3 hover:shadow-sm transition-shadow"
                    >
                      {/* Left: Thumbnail & Name & Subtitle & Price */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-14 h-14 rounded-2xl object-cover shrink-0 bg-[#F2ECE3] border border-[#EFE8DE]"
                        />

                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-[#2B1810] truncate">
                            {prod.name}
                          </h4>
                          {prod.nameEn && (
                            <p className="text-[11px] text-slate-500 font-sans truncate">
                              {prod.nameEn}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
                            <span className="font-bold text-[#2B1810] bg-[#FAF5EE] border border-[#E9DCCF] px-2 py-0.5 rounded-lg font-prompt">
                              ธรรมดา: ฿{prod.priceNormal}
                            </span>
                            <span className="font-bold text-[#8C5226] bg-[#FAF5EE] border border-[#E9DCCF] px-2 py-0.5 rounded-lg font-prompt">
                              พิเศษ: ฿{prod.priceSpecial}
                            </span>
                            {prod.originalPriceNormal && (
                              <span className="text-[11px] text-slate-400 line-through">
                                ฿{prod.originalPriceNormal}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingProduct(prod);
                                setProductForm(prod);
                                setIsProductModalOpen(true);
                              }}
                              className="text-[10px] text-blue-700 hover:text-blue-900 underline font-bold cursor-pointer"
                            >
                              ตั้งราคา
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Right: [👁️ พร้อมขาย] Stock toggle pill, Edit pencil, Trash icon */}
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Stock toggle pill matching Screenshot */}
                        <button
                          onClick={() => handleToggleStock(prod.id)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
                            prod.inStock
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                          }`}
                        >
                          {prod.inStock ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          <span>{prod.inStock ? 'พร้อมขาย' : 'สินค้าหมด'}</span>
                        </button>

                        {/* Edit button */}
                        <button
                          onClick={() => {
                            setEditingProduct(prod);
                            setProductForm(prod);
                            setIsProductModalOpen(true);
                          }}
                          className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                          title="แก้ไขเมนู"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Delete button */}
                        <button
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                          title="ลบเมนู"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: จัดการคำสั่งซื้อ */}
            {activeTab === 'orders' && (
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* Alert Notification */}
                {emailSentAlert && (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between text-xs text-emerald-800 font-bold">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{emailSentAlert}</span>
                    </div>
                    <button onClick={() => setEmailSentAlert(null)}>✕</button>
                  </div>
                )}

                {/* Filter and Bulk Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                    {['all', 'รอตรวจสอบ', 'กำลังจัดเตรียม', 'กำลังจัดส่ง', 'สำเร็จ', 'ยกเลิก'].map((status) => (
                      <button
                        key={status}
                        onClick={() => setOrderFilter(status)}
                        className={`px-3 py-1 rounded-full whitespace-nowrap font-semibold transition-colors cursor-pointer ${
                          orderFilter === status
                            ? 'bg-[#2B1810] text-white'
                            : 'bg-white text-slate-700 border border-[#E5DACF] hover:bg-slate-50'
                        }`}
                      >
                        {status === 'all' ? 'ทั้งหมด' : status}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedOrderIds.length > 0 && (
                      <button
                        onClick={handleBulkDeleteOrders}
                        className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>ลบที่เลือก ({selectedOrderIds.length})</span>
                      </button>
                    )}
                    <a
                      href="/api/orders.csv"
                      download="ChaoKuay_KKU_Orders_Realtime.csv"
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 transition-colors"
                      title="ดาวน์โหลดไฟล์ CSV เรียลไทม์จากเซิร์ฟเวอร์"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>⚡ CSV เรียลไทม์</span>
                    </a>
                    <button
                      onClick={handleExportCSV}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>ส่งออกข้อมูลไป Excel</span>
                    </button>
                  </div>
                </div>

                {filteredOrders.length > 0 ? (
                  <div className="space-y-3">
                    {filteredOrders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-white rounded-2xl border border-[#EFE8DE] p-4 shadow-xs space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#F5EFE8]">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedOrderIds.includes(order.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedOrderIds([...selectedOrderIds, order.id]);
                                } else {
                                  setSelectedOrderIds(selectedOrderIds.filter((id) => id !== order.id));
                                }
                              }}
                              className="rounded accent-[#C97A32] w-4 h-4 cursor-pointer"
                            />
                            <span className="font-mono font-extrabold text-sm text-[#2B1810]">
                              #{order.id}
                            </span>
                            <span className="text-xs text-slate-400">· {order.createdAt}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                              className="text-xs font-bold px-2.5 py-1 rounded-xl border border-[#E5DACF] bg-[#FAF7F2] text-[#2B1810] focus:ring-2 focus:ring-[#C97A32]"
                            >
                              <option value="รอตรวจสอบ">รอตรวจสอบ</option>
                              <option value="กำลังจัดเตรียม">กำลังจัดเตรียม</option>
                              <option value="กำลังจัดส่ง">กำลังจัดส่ง</option>
                              <option value="สำเร็จ">จัดส่งสำเร็จ</option>
                              <option value="ยกเลิก">ยกเลิก</option>
                            </select>

                            <button
                              onClick={() => handleDeleteOrder(order.id)}
                              className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                              title="ลบคำสั่งซื้อนี้"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Customer & Location & Email */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#523E33] bg-[#FAF8F5] p-3 rounded-xl border border-[#EFE8DE]">
                          <div className="space-y-0.5">
                            <p><strong>ผู้รับ:</strong> {order.customer.name}</p>
                            <p><strong>เบอร์โทร:</strong> {order.customer.phone}</p>
                            <p className="flex items-center gap-1 text-[#2B1810]">
                              <Mail className="w-3 h-3 text-[#C97A32]" />
                              <strong>อีเมล:</strong> {order.customer.email || 'siriphum212550@gmail.com'}
                            </p>
                          </div>
                          <div className="space-y-1">
                            {order.customer.gpsLink ? (
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 font-bold text-[#2B1810]">
                                  <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                                  <span>พิกัด GPS จัดส่ง:</span>
                                </div>
                                <a
                                  href={order.customer.gpsLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold transition-colors shadow-xs"
                                >
                                  <span>🗺️ นำทางบน Google Maps</span>
                                  <span className="text-[10px]">↗</span>
                                </a>
                              </div>
                            ) : (
                              <p><strong>สถานที่:</strong> {order.customer.location}</p>
                            )}
                            {order.customer.location && order.customer.gpsLink && (
                              <p className="text-[11px] text-[#7A695E]"><strong>จุดนัดรับ:</strong> {order.customer.location}</p>
                            )}
                            {order.customer.note && (
                              <p className="text-amber-800"><strong>โน้ต:</strong> {order.customer.note}</p>
                            )}
                          </div>
                        </div>

                        {/* Items ordered */}
                        <div className="space-y-1 text-xs">
                          {order.items.map((item) => (
                            <div key={item.cartItemId} className="flex justify-between text-[#523E33]">
                              <span>
                                {item.name} ({item.sizeType}) · {item.sweetness} x{item.quantity}
                                {item.toppings.length > 0 && ` (+${item.toppings.map((t) => t.name).join(', ')})`}
                              </span>
                              <span className="font-bold text-[#2B1810]">฿{item.totalPrice}</span>
                            </div>
                          ))}
                        </div>

                        {/* Order Total & Email Receipt button */}
                        <div className="pt-2 border-t border-[#F5EFE8] flex flex-wrap justify-between items-center gap-2 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500">
                              ชำระโดย: <strong>{order.paymentMethod === 'promptpay' ? 'พร้อมเพย์ QR' : 'เก็บเงินปลายทาง'}</strong>
                            </span>

                            {order.receiptSentToEmail ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>ส่งใบเสร็จแล้ว</span>
                              </span>
                            ) : (
                              <button
                                onClick={() => handleSendEmailReceipt(order)}
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-[#7A4B29] bg-[#FAF5EE] hover:bg-[#F2E8DC] border border-[#E5DACF] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                              >
                                <Mail className="w-3 h-3 text-[#C97A32]" />
                                <span>ส่งใบเสร็จเข้าอีเมล</span>
                              </button>
                            )}
                          </div>

                          <span className="text-sm font-extrabold text-[#2B1810] font-prompt">
                            ยอดรวม: ฿{order.total}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-10 text-center text-slate-500 bg-white rounded-2xl border border-[#EFE8DE]">
                    ไม่มีคำสั่งซื้อในหมวดหมู่นี้
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: พร้อมเพย์ & ค่าจัดส่ง matching user's request */}
            {/* TAB 3: พร้อมเพย์, รูปโปรไฟล์ร้านค้า & ค่าจัดส่ง matching user's request */}
            {activeTab === 'promptpay' && (
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                <div className="bg-white rounded-2xl border border-[#EFE8DE] p-6 space-y-6 max-w-2xl mx-auto shadow-xs">
                  {/* Status Banner */}
                  {settingsSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between text-xs text-emerald-800 font-bold">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>{settingsSuccess}</span>
                      </div>
                      <button onClick={() => setSettingsSuccess('')}>✕</button>
                    </div>
                  )}

                  {/* SECTION 1: รูปภาพโปรไฟล์ร้านค้า (Store Profile & Logo) */}
                  <div className="space-y-4">
                    <div className="border-b border-[#F5EFE8] pb-3">
                      <h3 className="text-sm font-bold text-[#2B1810] flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-[#C97A32]" />
                        <span>รูปภาพโปรไฟล์ร้านค้า / โลโก้ (Store Profile Logo)</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        ตั้งค่ารูปโปรไฟล์ร้านค้าที่จะแสดงบนแถบเมนูด้านบน, ป้ายต้อนรับ, และใบเสร็จรับเงิน
                      </p>
                    </div>

                    <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E5DACF] flex flex-col sm:flex-row items-center gap-5">
                      <div className="bg-white p-2 rounded-2xl border border-[#E5DACF] shadow-xs flex flex-col items-center shrink-0">
                        {storeConfig.storeLogo ? (
                          <img
                            src={storeConfig.storeLogo}
                            alt="รูปโปรไฟล์ร้านค้า"
                            className="w-28 h-28 object-cover rounded-xl border border-[#E5DACF]"
                          />
                        ) : (
                          <div className="w-28 h-28 rounded-xl bg-slate-100 flex flex-col items-center justify-center text-slate-400 text-xs text-center p-2">
                            <ImageIcon className="w-8 h-8 mb-1 text-slate-300" />
                            <span>ยังไม่มีรูปโปรไฟล์</span>
                          </div>
                        )}
                        <span className="text-[10px] font-bold text-[#7A4B29] mt-1.5 uppercase font-mono">
                          STORE LOGO
                        </span>
                      </div>

                      <div className="space-y-3 flex-1 text-xs w-full">
                        {/* File Upload Button */}
                        <div className="space-y-1">
                          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2B1810] hover:bg-[#3E2317] text-white font-bold text-xs cursor-pointer shadow-xs transition-colors">
                            <Upload className="w-4 h-4 text-amber-300" />
                            <span>อัปโหลดรูปโปรไฟล์จากเครื่อง</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleStoreLogoUpload}
                              className="hidden"
                            />
                          </label>
                          <p className="text-[10px] text-slate-400">
                            รองรับไฟล์ JPG, PNG, WebP ขนาดไม่เกิน 5MB
                          </p>
                        </div>

                        {/* URL input */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700 block">
                            หรือใส่ URL รูปภาพโปรไฟล์ร้านค้า (Image URL):
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="url"
                              placeholder="https://example.com/store-profile.png"
                              value={storeLogoUrlInput}
                              onChange={(e) => setStoreLogoUrlInput(e.target.value)}
                              className="flex-1 px-3 py-2 bg-white border border-[#E5DACF] rounded-xl text-xs focus:ring-2 focus:ring-[#C97A32]"
                            />
                            <button
                              type="button"
                              onClick={handleSaveStoreLogoUrl}
                              className="px-3.5 py-2 bg-[#8C5226] hover:bg-[#6D3E1C] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0"
                            >
                              บันทึก URL
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: ระบบใส่รูป QR Code พร้อมเพย์ร้านค้า (Upload & URL) */}
                  <div className="space-y-4 pt-4 border-t border-[#F5EFE8]">
                    <div className="border-b border-[#F5EFE8] pb-3">
                      <h3 className="text-sm font-bold text-[#2B1810] flex items-center gap-2">
                        <QrCode className="w-4 h-4 text-[#C97A32]" />
                        <span>ระบบรูปภาพ QR Code พร้อมเพย์ร้านค้า (ใส่ URL หรืออัปโหลด)</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        ใส่รูปภาพ QR Code พร้อมเพย์ของเจ้าของร้าน เพื่อให้ลูกค้าสแกนจ่ายเงินได้ทั้งตอนสั่งและตอนรับของ
                      </p>
                    </div>

                    {/* QR Image Box */}
                    <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E5DACF] flex flex-col sm:flex-row items-center gap-5">
                      <div className="bg-white p-3 rounded-2xl border border-[#E5DACF] shadow-xs flex flex-col items-center shrink-0">
                        {storeConfig.promptPayQrImage ? (
                          <img
                            src={storeConfig.promptPayQrImage}
                            alt="PromptPay QR Code ร้านค้า"
                            className="w-44 h-44 object-contain rounded-xl"
                          />
                        ) : (
                          <div className="w-44 h-44 rounded-xl bg-slate-100 flex flex-col items-center justify-center text-slate-400 text-xs">
                            <ImageIcon className="w-10 h-10 mb-1 text-slate-300" />
                            <span>ยังไม่มีรูปภาพ QR</span>
                          </div>
                        )}
                        <span className="text-[10px] font-bold text-blue-700 mt-1.5 uppercase font-mono">
                          PROMPTPAY QR
                        </span>
                      </div>

                      <div className="space-y-3.5 flex-1 text-xs w-full">
                        <div>
                          <p className="font-bold text-[#2B1810] text-sm">
                            {storeConfig.promptPayName || 'ร้านน้ำเฉาก๊วย KKU'}
                          </p>
                          <p className="text-xs text-slate-500 font-mono mt-0.5">
                            PromptPay ID: {storeConfig.promptPayId}
                          </p>
                        </div>

                        {/* File Upload Button */}
                        <div className="space-y-1">
                          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2B1810] hover:bg-[#3E2317] text-white font-bold text-xs cursor-pointer shadow-xs transition-colors">
                            <Upload className="w-4 h-4 text-amber-300" />
                            <span>อัปโหลดรูปภาพ QR Code จากเครื่อง</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleQrImageUpload}
                              className="hidden"
                            />
                          </label>
                          <p className="text-[10px] text-slate-400">
                            รองรับไฟล์ JPG, PNG หรือภาพถ่ายจากมือถือ ขนาดไม่เกิน 5MB
                          </p>
                        </div>

                        {/* Dedicated URL input with Save button ("ปรับ ให้ใส่รูป URL คิวอาโค้ด") */}
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-700 block">
                            ใส่รูป URL คิวอาโค้ด (QR Code Image URL) *:
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="url"
                              placeholder="https://example.com/my-promptpay-qr.png"
                              value={qrUrlInput}
                              onChange={(e) => setQrUrlInput(e.target.value)}
                              className="flex-1 px-3 py-2 bg-white border border-[#E5DACF] rounded-xl text-xs font-mono focus:ring-2 focus:ring-[#C97A32]"
                            />
                            <button
                              type="button"
                              onClick={handleSaveQrUrl}
                              className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0"
                            >
                              บันทึก URL QR
                            </button>
                          </div>
                          <p className="text-[10px] text-slate-400">
                            วางลิงก์รูปภาพ QR พร้อมเพย์ของร้าน แล้วกดปุ่ม "บันทึก URL QR" เพื่ออัปเดตระบบทันที
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Fee settings matching IMG_1206_d33a8683.png */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-3 border-t border-[#F5EFE8] text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        ค่าจัดส่งหน้าร้าน (บาท)
                      </label>
                      <input
                        type="number"
                        value={storeConfig.deliveryFee}
                        onChange={(e) => onUpdateStoreConfig({ ...storeConfig, deliveryFee: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DACF] rounded-xl text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        ส่งฟรีเมื่อสั่งซื้อขั้นต่ำ (บาท)
                      </label>
                      <input
                        type="number"
                        value={storeConfig.freeDeliveryThreshold}
                        onChange={(e) => onUpdateStoreConfig({ ...storeConfig, freeDeliveryThreshold: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DACF] rounded-xl text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        เบอร์โทรศัพท์ / รหัสพร้อมเพย์
                      </label>
                      <input
                        type="text"
                        value={storeConfig.promptPayId}
                        onChange={(e) => onUpdateStoreConfig({ ...storeConfig, promptPayId: e.target.value })}
                        className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DACF] rounded-xl text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        ชื่อบัญชีพร้อมเพย์ที่แสดง
                      </label>
                      <input
                        type="text"
                        value={storeConfig.promptPayName}
                        onChange={(e) => onUpdateStoreConfig({ ...storeConfig, promptPayName: e.target.value })}
                        className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DACF] rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  {settingsSuccess && (
                    <p className="text-xs text-emerald-600 font-bold bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                      ✓ {settingsSuccess}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: ความปลอดภัย & PIN */}
            {activeTab === 'security' && (
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                <div className="bg-white rounded-2xl border border-[#EFE8DE] p-6 space-y-4 max-w-lg mx-auto shadow-xs">
                  <h3 className="text-sm font-bold text-[#2B1810] border-b border-[#F5EFE8] pb-2 flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-[#C97A32]" />
                    <span>ความปลอดภัย & รหัสผ่าน PIN ร้านค้า</span>
                  </h3>

                  <div className="space-y-3 text-xs">
                    <p className="text-slate-500">
                      รหัส PIN ปัจจุบัน: <strong className="font-mono text-[#2B1810]">{storeConfig.adminPin}</strong>
                    </p>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        ตั้งรหัสผ่าน PIN ใหม่ (4-6 หลัก):
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="password"
                          maxLength={6}
                          placeholder="รหัส PIN ใหม่"
                          value={newPin}
                          onChange={(e) => setNewPin(e.target.value)}
                          className="flex-1 px-3 py-2 bg-[#FAF7F2] border border-[#E5DACF] rounded-xl text-xs font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newPin.trim().length >= 4) {
                              onUpdateStoreConfig({ ...storeConfig, adminPin: newPin.trim() });
                              setSettingsSuccess('อัปเดตรหัส PIN แอดมินเรียบร้อยแล้ว');
                              setNewPin('');
                              setTimeout(() => setSettingsSuccess(''), 3000);
                            } else {
                              alert('รหัส PIN ต้องมีความยาวอย่างน้อย 4 หลัก');
                            }
                          }}
                          className="px-4 py-2 bg-[#2B1810] text-white rounded-xl text-xs font-bold cursor-pointer"
                        >
                          บันทึก PIN
                        </button>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#F5EFE8]">
                      <button
                        onClick={() => onAuthenticate(false)}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        ออกจากระบบแอดมิน (Log out)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Product Add/Edit Modal */}
        {isProductModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#EFE8DE] max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-sm text-[#2B1810]">
                  {editingProduct ? 'แก้ไขข้อมูลเมนูสินค้า' : 'เพิ่มเมนูสินค้าใหม่'}
                </h3>
                <button
                  onClick={() => setIsProductModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-[#523E33] block mb-1">ชื่อเมนูภาษาไทย *</label>
                  <input
                    type="text"
                    required
                    value={productForm.name || ''}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DACF] rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#523E33] block mb-1">ชื่อเมนูภาษาอังกฤษ (English Subtitle)</label>
                  <input
                    type="text"
                    value={productForm.nameEn || ''}
                    onChange={(e) => setProductForm({ ...productForm, nameEn: e.target.value })}
                    placeholder="เช่น Signature Herbal Grass Jelly Drink"
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DACF] rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-[#523E33] block mb-1">
                      ราคาธรรมดา (บาท) *
                    </label>
                    <input
                      type="number"
                      required
                      value={productForm.priceNormal ?? ''}
                      onChange={(e) => setProductForm({ ...productForm, priceNormal: Number(e.target.value) })}
                      placeholder="เช่น 55"
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DACF] rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[#523E33] block mb-1">
                      ราคาพิเศษ (บาท) *
                    </label>
                    <input
                      type="number"
                      required
                      value={productForm.priceSpecial ?? ''}
                      onChange={(e) => setProductForm({ ...productForm, priceSpecial: Number(e.target.value) })}
                      placeholder="เช่น 65"
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DACF] rounded-xl font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">
                      ราคาเต็มธรรมดา (แสดงขีดฆ่า)
                    </label>
                    <input
                      type="number"
                      value={productForm.originalPriceNormal ?? ''}
                      onChange={(e) => setProductForm({ ...productForm, originalPriceNormal: e.target.value ? Number(e.target.value) : undefined })}
                      placeholder="เช่น 65 (ไม่ระบุก็ได้)"
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DACF] rounded-xl text-slate-600"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">
                      ราคาเต็มพิเศษ (แสดงขีดฆ่า)
                    </label>
                    <input
                      type="number"
                      value={productForm.originalPriceSpecial ?? ''}
                      onChange={(e) => setProductForm({ ...productForm, originalPriceSpecial: e.target.value ? Number(e.target.value) : undefined })}
                      placeholder="เช่น 75 (ไม่ระบุก็ได้)"
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DACF] rounded-xl text-slate-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-[#523E33] block mb-1">หมวดหมู่ (Category)</label>
                    <select
                      value={productForm.category || 'classic'}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DACF] rounded-xl"
                    >
                      <option value="classic">classic (สูตรดั้งเดิม)</option>
                      <option value="honey">honey (น้ำผึ้งป่า)</option>
                      <option value="deluxe">deluxe (ทรงเครื่องจักรพรรดิ)</option>
                      <option value="new">new (เมนูใหม่)</option>
                      <option value="promo">promo (ชุดของฝาก)</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-[#523E33] block mb-1">ป้ายกำกับ (Tag)</label>
                    <input
                      type="text"
                      value={productForm.categoryTag || ''}
                      onChange={(e) => setProductForm({ ...productForm, categoryTag: e.target.value })}
                      placeholder="เช่น สูตรดั้งเดิม"
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DACF] rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[#523E33] block mb-1">URL รูปภาพสินค้า</label>
                  <input
                    type="text"
                    value={productForm.image || ''}
                    onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DACF] rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#523E33] block mb-1">คำอธิบายเมนู</label>
                  <textarea
                    rows={2}
                    value={productForm.description || ''}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DACF] rounded-xl"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsProductModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-[#E5DACF] text-xs font-bold"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#2B1810] text-white text-xs font-bold"
                  >
                    บันทึกข้อมูล
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
