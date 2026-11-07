import React, { useState, useEffect } from 'react';
import { X, MapPin, Phone, User, QrCode, Banknote, ShieldCheck, CheckCircle2, Mail, Download, ZoomIn, LogIn } from 'lucide-react';
import { CartItem, CustomerInfo, Order, StoreConfig, GoogleUserProfile } from '../types';
import { KKU_CAMPUS_ZONES } from '../data';
import { loginWithGoogle } from '../firebase';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  storeConfig: StoreConfig;
  onOrderSuccess: (order: Order) => void;
  googleUser?: GoogleUserProfile;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  cart,
  storeConfig,
  onOrderSuccess,
  googleUser
}: CheckoutModalProps) {
  if (!isOpen) return null;

  const [customer, setCustomer] = useState<CustomerInfo>(() => ({
    name: googleUser?.name || 'Siriphum Ngokkam',
    phone: '081-234-5678',
    email: googleUser?.email || 'siriphum212550@gmail.com',
    gpsLink: 'https://maps.google.com/?q=16.4744,102.8231',
    location: '',
    note: ''
  }));

  // Sync customer details when googleUser changes
  useEffect(() => {
    if (googleUser && googleUser.isLoggedIn) {
      setCustomer((prev) => ({
        ...prev,
        name: googleUser.name || prev.name,
        email: googleUser.email || prev.email
      }));
    }
  }, [googleUser]);

  const handleGoogleSignInAtCheckout = async () => {
    try {
      const user = await loginWithGoogle();
      if (user) {
        setCustomer((prev) => ({
          ...prev,
          name: user.displayName || prev.name,
          email: user.email || prev.email
        }));
      }
    } catch (e: any) {
      console.warn('Checkout Google Sign-In error:', e);
    }
  };

  const [paymentMethod, setPaymentMethod] = useState<'promptpay' | 'cash'>('promptpay');
  const [sendEmailReceipt, setSendEmailReceipt] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slipUploaded, setSlipUploaded] = useState(false);
  const [zoomQr, setZoomQr] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsSuccess, setGpsSuccess] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const isFreeDelivery = subtotal >= storeConfig.freeDeliveryThreshold;
  const deliveryFee = isFreeDelivery ? 0 : storeConfig.deliveryFee;
  const grandTotal = subtotal + deliveryFee;

  // Use shop owner's custom PromptPay QR image if uploaded, otherwise fallback to generated QR
  const activeQrImageUrl =
    storeConfig.promptPayQrImage ||
    `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=PROMPTPAY_${storeConfig.promptPayId}_AMOUNT_${grandTotal}_THB`;

  // Geolocation auto-detection
  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      setGpsError('อุปกรณ์ของคุณไม่รองรับการดึงพิกัด GPS อัตโนมัติ กรุณาคัดลอกลิงก์จาก Google Maps โดยตรง');
      return;
    }

    setIsDetectingGps(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const link = `https://www.google.com/maps?q=${lat},${lng}`;
        setCustomer((prev) => ({
          ...prev,
          gpsLink: link,
          location: prev.location || `พิกัด GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}`
        }));
        setIsDetectingGps(false);
        setGpsSuccess(true);
        setTimeout(() => setGpsSuccess(false), 4000);
      },
      (err) => {
        setIsDetectingGps(false);
        setGpsError('ไม่สามารถดึงตำแหน่ง GPS ได้ กรุณาเปิดสิทธิ์ GPS หรือคัดลอกลิงก์ Google Maps มาวาง');
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.name.trim() || !customer.phone.trim()) {
      alert('กรุณากรอกข้อมูลชื่อและเบอร์โทรศัพท์ติดต่อให้ครบถ้วน');
      return;
    }

    if (!customer.gpsLink.trim()) {
      alert('กรุณาใส่ลิงก์พิกัด GPS (Google Maps) หรือกดปุ่ม "ดึงพิกัด GPS ปัจจุบัน" เพื่อให้ร้านค้านำทางไปส่งได้ถูกต้อง');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const now = new Date();
      const thaiMonths = [
        'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
      ];
      const thaiYear = now.getFullYear() + 543;
      const formattedDate = `${now.getDate()} ${thaiMonths[now.getMonth()]} ${thaiYear}, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} น.`;

      const newOrder: Order = {
        id: `CK-${Math.floor(100000 + Math.random() * 900000)}`,
        createdAt: formattedDate,
        items: [...cart],
        subtotal,
        deliveryFee,
        total: grandTotal,
        status: 'รอตรวจสอบ',
        customer: { ...customer },
        paymentMethod,
        slipImage: slipUploaded ? 'attached_slip_mock' : undefined,
        receiptSentToEmail: sendEmailReceipt,
        receiptSentAt: sendEmailReceipt ? formattedDate : undefined
      };

      setIsSubmitting(false);
      onOrderSuccess(newOrder);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-[#EFE8DE] overflow-hidden my-4 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 bg-[#FAF7F2] border-b border-[#EFE8DE] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            {storeConfig.storeLogo ? (
              <img
                src={storeConfig.storeLogo}
                alt="โลโก้ร้านค้า"
                className="w-9 h-9 rounded-xl object-cover border border-[#E5DACF] shadow-xs"
              />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-[#2B1810] text-[#E5A850] flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
            )}
            <div>
              <h2 className="text-base font-bold text-[#2B1810]">ข้อมูลการจัดส่ง & ชำระเงิน</h2>
              <p className="text-xs text-[#7A695E]">ระบบจัดส่งผ่านลิงก์พิกัด GPS (Google Maps)</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-[#F2ECE3] text-[#7A695E] flex items-center justify-center transition-colors cursor-pointer border border-[#E5DACF]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5 flex-1 text-[#2B1810]">
          {/* Real Google Account Card */}
          <div className="bg-[#FAF8F5] border border-[#E5DACF] rounded-2xl p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={googleUser?.picture || '/assets/aistudio/student_avatar.png'}
                alt={googleUser?.name || 'Google User'}
                className="w-10 h-10 rounded-full object-cover border border-[#E5DACF] shrink-0 bg-white"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/aistudio/student_avatar.png';
                }}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#2B1810] truncate">
                    {googleUser?.name || customer.name || 'ผู้สั่งซื้อ'}
                  </span>
                  {googleUser?.isLoggedIn ? (
                    <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                      <span>บัญชี Google ของคุณ</span>
                    </span>
                  ) : (
                    <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                      ผู้เยี่ยมชม
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#7A695E] truncate">
                  {googleUser?.email || customer.email || 'กรอกอีเมลด้านล่างเพื่อรับใบเสร็จ'}
                </p>
              </div>
            </div>

            {!googleUser?.isLoggedIn && (
              <button
                type="button"
                onClick={handleGoogleSignInAtCheckout}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-[#E5DACF] text-xs font-bold text-[#2B1810] flex items-center gap-1.5 shadow-2xs transition-colors shrink-0 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>ล็อกอิน Google</span>
              </button>
            )}
          </div>

          {/* Customer Personal Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A4B29] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>ข้อมูลผู้สั่งซื้อ</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-[#523E33] block mb-1">
                  ชื่อ-นามสกุล *
                </label>
                <input
                  type="text"
                  required
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  placeholder="เช่น สมชาย ใจดี"
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DACF] rounded-xl text-xs focus:ring-2 focus:ring-[#C97A32]/40 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#523E33] block mb-1">
                  เบอร์โทรศัพท์ติดต่อ *
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-[#9C8A7E] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    placeholder="08X-XXX-XXXX"
                    className="w-full pl-8 pr-3 py-2 bg-[#FAF7F2] border border-[#E5DACF] rounded-xl text-xs focus:ring-2 focus:ring-[#C97A32]/40 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Email Field & E-Receipt Checkbox */}
            <div>
              <label className="text-xs font-medium text-[#523E33] block mb-1">
                อีเมลสำหรับรับใบเสร็จรับเงิน (E-Receipt) *
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-[#9C8A7E] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={customer.email}
                  onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                  placeholder="example@kkumail.com"
                  className="w-full pl-8 pr-3 py-2 bg-[#FAF7F2] border border-[#E5DACF] rounded-xl text-xs focus:ring-2 focus:ring-[#C97A32]/40 focus:outline-none"
                />
              </div>
              <label className="flex items-center gap-2 mt-1.5 cursor-pointer text-xs text-[#523E33]">
                <input
                  type="checkbox"
                  checked={sendEmailReceipt}
                  onChange={(e) => setSendEmailReceipt(e.target.checked)}
                  className="rounded accent-[#C97A32]"
                />
                <span>ส่งใบเสร็จรับเงินยืนยันคำสั่งซื้อเข้าอีเมลนี้โดยอัตโนมัติ</span>
              </label>
            </div>
          </div>

          {/* Delivery: Changed Entirely to GPS Link (ส่งลิงก์ GPS) */}
          <div className="space-y-3 pt-2 border-t border-[#F5EFE8]">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A4B29] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-red-600" />
                <span>จุดจัดส่ง: ส่งลิงก์พิกัด GPS (Google Maps)*</span>
              </h3>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                นำทางแม่นยำ 100%
              </span>
            </div>

            {/* Auto-detect GPS button & status */}
            <div className="bg-[#FAF8F5] border border-[#E5DACF] rounded-2xl p-3.5 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleDetectGps}
                  disabled={isDetectingGps}
                  className="px-4 py-2 rounded-xl bg-[#2B1810] hover:bg-[#3E2317] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-60"
                >
                  <MapPin className="w-3.5 h-3.5 text-amber-300" />
                  <span>
                    {isDetectingGps ? 'กำลังค้นหาตำแหน่ง GPS...' : '📍 ดึงพิกัด GPS ปัจจุบันของคุณ'}
                  </span>
                </button>

                {customer.gpsLink && (
                  <a
                    href={customer.gpsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-bold transition-colors"
                  >
                    <span>🗺️ ทดสอบเปิดดูพิกัดบนแผนที่</span>
                    <span className="text-[10px]">↗</span>
                  </a>
                )}
              </div>

              {gpsSuccess && (
                <p className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>ดึงพิกัด GPS ปัจจุบันสำเร็จและสร้างลิงก์ Google Maps เรียบร้อยแล้ว!</span>
                </p>
              )}

              {gpsError && (
                <p className="text-[11px] text-rose-600 font-medium">
                  ⚠️ {gpsError}
                </p>
              )}

              {/* Direct GPS Link Input */}
              <div>
                <label className="text-[11px] font-bold text-[#523E33] block mb-1">
                  ลิงก์ Google Maps / GPS Link *
                </label>
                <input
                  type="url"
                  required
                  value={customer.gpsLink}
                  onChange={(e) => setCustomer({ ...customer, gpsLink: e.target.value })}
                  placeholder="https://maps.app.goo.gl/... หรือ https://www.google.com/maps?q=..."
                  className="w-full px-3 py-2 bg-white border border-[#E5DACF] rounded-xl text-xs font-mono focus:ring-2 focus:ring-[#C97A32]/40 focus:outline-none"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  คัดลอกลิงก์แชร์จาก Google Maps หรือกดปุ่ม "ดึงพิกัด GPS ปัจจุบัน" ด้านบนได้ทันที
                </p>
              </div>

              {/* Optional landmark or building note */}
              <div>
                <label className="text-[11px] font-medium text-[#523E33] block mb-1">
                  จุดสังเกตเพิ่มเติม (อาคาร, ชั้น, ตู้เต่าบิน หรือจุดนัดรับ)
                </label>
                <input
                  type="text"
                  value={customer.location || ''}
                  onChange={(e) => setCustomer({ ...customer, location: e.target.value })}
                  placeholder="เช่น ข้างป้อม รปภ., ใต้หอ 9 หลัง, ตึก EN04 ชั้น 1"
                  className="w-full px-3 py-2 bg-white border border-[#E5DACF] rounded-xl text-xs focus:ring-2 focus:ring-[#C97A32]/40 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#523E33] block mb-1">
                  หมายเหตุถึงไรเดอร์ (ถ้ามี)
                </label>
                <input
                  type="text"
                  value={customer.note || ''}
                  onChange={(e) => setCustomer({ ...customer, note: e.target.value })}
                  placeholder="เช่น โทรแจ้งเมื่อใกล้ถึง, ขอหลอดเพิ่ม"
                  className="w-full px-3 py-2 bg-white border border-[#E5DACF] rounded-xl text-xs focus:ring-2 focus:ring-[#C97A32]/40 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Payment Method: PromptPay OR Cash (Both show QR code scan option) */}
          <div className="space-y-3 pt-2 border-t border-[#F5EFE8]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A4B29] flex items-center gap-1.5">
              <Banknote className="w-3.5 h-3.5" />
              <span>ช่องทางการชำระเงิน</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {/* PromptPay */}
              <button
                type="button"
                onClick={() => setPaymentMethod('promptpay')}
                className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  paymentMethod === 'promptpay'
                    ? 'border-[#C97A32] bg-[#FAF5EE] ring-2 ring-[#C97A32]/25'
                    : 'border-[#E5DACF] bg-white hover:bg-[#FAF7F2]'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-xs text-[#2B1810]">สแกน พร้อมเพย์ (PromptPay)</p>
                  <p className="text-[10px] text-[#7A695E] mt-0.5">โอนชำระเงินทันที</p>
                </div>
              </button>

              {/* Cash / Scan on Delivery */}
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  paymentMethod === 'cash'
                    ? 'border-[#C97A32] bg-[#FAF5EE] ring-2 ring-[#C97A32]/25'
                    : 'border-[#E5DACF] bg-white hover:bg-[#FAF7F2]'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                  <Banknote className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-xs text-[#2B1810]">ชำระสด / สแกน QR ตอนรับของ</p>
                  <p className="text-[10px] text-[#7A695E] mt-0.5">เงินสดหรือสแกนตอนรับ</p>
                </div>
              </button>
            </div>

            {/* PromptPay QR Preview - ALWAYS VISIBLE for both PromptPay and Cash ("คนที่ซื้อสด ก็ ให้สแกนQR") */}
            <div className="bg-[#FAF7F2] border border-[#EFE8DE] rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="bg-white p-2.5 rounded-xl border border-[#E5DACF] shadow-xs shrink-0 flex flex-col items-center">
                <div className="relative group">
                  <img
                    src={activeQrImageUrl}
                    alt="PromptPay QR Code ร้านค้า"
                    className="w-36 h-36 object-contain cursor-pointer rounded-lg"
                    onClick={() => setZoomQr(true)}
                  />
                  <button
                    type="button"
                    onClick={() => setZoomQr(true)}
                    className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg transition-opacity text-[11px] font-bold gap-1 cursor-pointer"
                  >
                    <ZoomIn className="w-4 h-4" />
                    <span>ขยายดู</span>
                  </button>
                </div>
                <span className="block text-[9px] font-bold text-center text-blue-700 mt-1 uppercase font-mono">
                  {storeConfig.promptPayQrImage ? 'QR พร้อมเพย์ร้านค้า' : 'PromptPay QR'}
                </span>
              </div>

              <div className="space-y-1.5 text-xs flex-1">
                {paymentMethod === 'cash' ? (
                  <div className="inline-block px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold border border-emerald-200 mb-1">
                    💵 สามารถเตรียมเงินสด หรือ สแกน QR Code นี้ตอนรับสินค้าได้ทันที
                  </div>
                ) : (
                  <div className="inline-block px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-[10px] font-bold border border-blue-200 mb-1">
                    ⚡ สแกนเพื่อโอนชำระเงินทันทีผ่านพร้อมเพย์ QR
                  </div>
                )}

                <p className="font-bold text-[#2B1810]">
                  ยอดชำระสุทธิ: <span className="text-base text-[#C97A32] font-prompt">฿{grandTotal}</span>
                </p>
                <p className="text-[11px] text-[#7A695E]">
                  พร้อมเพย์ ID: <strong className="font-mono text-[#2B1810]">{storeConfig.promptPayId}</strong>
                </p>
                <p className="text-[10px] text-[#8C7A6F]">
                  ชื่อบัญชี: {storeConfig.promptPayName}
                </p>

                <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                  <button
                    type="button"
                    onClick={() => setSlipUploaded(!slipUploaded)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                      slipUploaded
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                        : 'bg-white border-[#E5DACF] text-[#523E33] hover:bg-[#F2ECE3]'
                    }`}
                  >
                    <CheckCircle2 className={`w-3.5 h-3.5 ${slipUploaded ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>{slipUploaded ? 'แนบสลิปแล้ว ✓' : 'แนบสลิปโอนเงิน (ถ้ามี)'}</span>
                  </button>

                  <a
                    href={activeQrImageUrl}
                    target="_blank"
                    rel="noreferrer"
                    download="PromptPay_QR_KKU.png"
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-[#E5DACF] bg-white text-[#523E33] hover:bg-[#F2ECE3] flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-[#7A695E]" />
                    <span>บันทึกรูป QR</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary breakdown */}
          <div className="bg-[#F8F4EE] rounded-2xl p-3.5 border border-[#EFE8DE] space-y-2 text-xs">
            <h4 className="font-bold text-[#2B1810]">สรุปรายการ ({cart.length} รายการ)</h4>
            <div className="max-h-28 overflow-y-auto space-y-1 divide-y divide-[#EFE8DE]/60 pr-1">
              {cart.map((item) => (
                <div key={item.cartItemId} className="flex justify-between py-1 text-[11px]">
                  <span className="truncate pr-2">
                    {item.name} ({item.sizeType}) x{item.quantity}
                  </span>
                  <span className="font-bold shrink-0">฿{item.totalPrice}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-[#E5DACF] space-y-1 text-[#7A695E]">
              <div className="flex justify-between">
                <span>ยอดรวมสินค้า:</span>
                <span className="font-bold text-[#2B1810]">฿{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>ค่าจัดส่งใน มข.:</span>
                <span className={deliveryFee === 0 ? 'font-bold text-emerald-600' : 'font-bold text-[#2B1810]'}>
                  {deliveryFee === 0 ? 'ฟรี (โปรโมชั่น)' : `฿${deliveryFee}`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-[#2B1810] pt-1 border-t border-[#E5DACF]">
                <span>ยอดสุทธิที่ต้องชำระ:</span>
                <span className="text-lg font-prompt text-[#2B1810]">฿{grandTotal}</span>
              </div>
            </div>
          </div>

          {/* Submit Order Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#2B1810] hover:bg-[#3E2317] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer active:scale-98 disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4 text-amber-300" />
            <span>
              {isSubmitting ? 'กำลังบันทึกคำสั่งซื้อ...' : `ยืนยันและสั่งซื้อ (฿${grandTotal})`}
            </span>
          </button>
        </form>

        {/* QR Code Zoom Modal */}
        {zoomQr && (
          <div
            className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs cursor-pointer"
            onClick={() => setZoomQr(false)}
          >
            <div
              className="bg-white p-5 rounded-3xl max-w-sm w-full text-center space-y-3 shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setZoomQr(false)}
                className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
              <h4 className="font-bold text-sm text-[#2B1810]">QR Code พร้อมเพย์ร้านค้า</h4>
              <p className="text-xs text-[#7A695E]">{storeConfig.promptPayName}</p>
              <img
                src={activeQrImageUrl}
                alt="PromptPay QR Code"
                className="w-64 h-64 object-contain mx-auto rounded-xl border border-slate-100"
              />
              <p className="font-mono font-bold text-xs text-[#2B1810]">
                ID: {storeConfig.promptPayId} · ยอด: ฿{grandTotal}
              </p>
              <a
                href={activeQrImageUrl}
                download="PromptPay_QR_KKU.png"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2B1810] text-white text-xs font-bold"
              >
                <Download className="w-4 h-4" />
                <span>บันทึกรูปลงเครื่อง</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
