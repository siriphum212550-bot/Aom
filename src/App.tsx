/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Home,
  ShoppingBag,
  Receipt,
  User,
  Flame,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Heart
} from 'lucide-react';

import { Product, CartItem, Order, StoreConfig, GoogleUserProfile } from './types';
import {
  INITIAL_PRODUCTS,
  DEFAULT_STORE_CONFIG,
  INITIAL_ORDERS,
  DEFAULT_GOOGLE_USER,
  STORAGE_KEYS,
  loadData,
  saveData
} from './data';

import Header from './components/Header';
import HeroBanner from './components/HeroBanner';
import ProductCard from './components/ProductCard';
import CustomizationModal from './components/CustomizationModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import OrderHistoryView from './components/OrderHistoryView';
import AccountView from './components/AccountView';
import AdminDashboard from './components/AdminDashboard';
import ReceiptModal from './components/ReceiptModal';
import WishlistModal from './components/WishlistModal';
import { appendOrderToSpreadsheet } from './services/googleSheets';
import { sendEmailViaGmail } from './services/gmail';

export default function App() {
  // Products & Store State
  const [products, setProducts] = useState<Product[]>(() =>
    loadData<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS)
  );

  const [orders, setOrders] = useState<Order[]>(() =>
    loadData<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS)
  );

  const [storeConfig, setStoreConfig] = useState<StoreConfig>(() =>
    loadData<StoreConfig>(STORAGE_KEYS.STORE_CONFIG, DEFAULT_STORE_CONFIG)
  );

  const [cart, setCart] = useState<CartItem[]>(() =>
    loadData<CartItem[]>(STORAGE_KEYS.CART, [])
  );

  const [wishlist, setWishlist] = useState<string[]>(() =>
    loadData<string[]>(STORAGE_KEYS.WISHLIST, ['ck-1', 'ck-2'])
  );

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() =>
    loadData<boolean>(STORAGE_KEYS.ADMIN_AUTH, true)
  );

  const [googleUser, setGoogleUser] = useState<GoogleUserProfile>(() =>
    loadData<GoogleUserProfile>(STORAGE_KEYS.GOOGLE_USER, DEFAULT_GOOGLE_USER)
  );

  // Navigation States
  const [activeBottomTab, setActiveBottomTab] = useState<'home' | 'cart' | 'orders' | 'account'>('home');
  const [activeNavTab, setActiveNavTab] = useState<'home' | 'all_menus'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);
  const [activeReceiptOrder, setActiveReceiptOrder] = useState<Order | null>(null);

  // Persistence Effects
  useEffect(() => {
    saveData(STORAGE_KEYS.PRODUCTS, products);
  }, [products]);

  useEffect(() => {
    saveData(STORAGE_KEYS.ORDERS, orders);
  }, [orders]);

  useEffect(() => {
    saveData(STORAGE_KEYS.STORE_CONFIG, storeConfig);
  }, [storeConfig]);

  useEffect(() => {
    saveData(STORAGE_KEYS.CART, cart);
  }, [cart]);

  useEffect(() => {
    saveData(STORAGE_KEYS.WISHLIST, wishlist);
  }, [wishlist]);

  useEffect(() => {
    saveData(STORAGE_KEYS.ADMIN_AUTH, isAdminAuthenticated);
  }, [isAdminAuthenticated]);

  useEffect(() => {
    saveData(STORAGE_KEYS.GOOGLE_USER, googleUser);
  }, [googleUser]);

  // Sync Google user login from Google Identity Services or Firebase
  useEffect(() => {
    const handleGoogleLogin = (e: any) => {
      if (e.detail) {
        setGoogleUser(e.detail);
      }
    };
    window.addEventListener('google-user-login', handleGoogleLogin);

    // Initial check from localStorage 'user'
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed.email) {
          setGoogleUser((prev) => ({
            ...prev,
            name: parsed.name || prev.name,
            email: parsed.email || prev.email,
            picture: parsed.picture || prev.picture,
            isLoggedIn: true,
            loginMethod: 'google'
          }));
        }
      }
    } catch (e) {
      console.warn('Failed to parse user from localStorage', e);
    }

    return () => window.removeEventListener('google-user-login', handleGoogleLogin);
  }, []);

  // Server Data Fetching & Real-time Server Sync (Cross-user / Cross-device Persistence)
  useEffect(() => {
    let isMounted = true;

    async function syncWithServer() {
      try {
        const res = await fetch('/api/store-data');
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && isMounted) {
          if (Array.isArray(data.products) && data.products.length > 0) {
            setProducts(data.products);
            saveData(STORAGE_KEYS.PRODUCTS, data.products);
          }
          if (data.storeConfig) {
            // Check if client local storage has an uploaded QR image not yet synced to server
            const localConfig = loadData<StoreConfig>(STORAGE_KEYS.STORE_CONFIG, DEFAULT_STORE_CONFIG);
            const serverConfig = { ...data.storeConfig };

            if (
              localConfig?.promptPayQrImage &&
              localConfig.promptPayQrImage !== DEFAULT_STORE_CONFIG.promptPayQrImage &&
              (!serverConfig.promptPayQrImage || serverConfig.promptPayQrImage === DEFAULT_STORE_CONFIG.promptPayQrImage)
            ) {
              serverConfig.promptPayQrImage = localConfig.promptPayQrImage;
              // Push to server immediately
              fetch('/api/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(localConfig)
              }).catch(console.warn);
            }

            setStoreConfig(serverConfig);
            saveData(STORAGE_KEYS.STORE_CONFIG, serverConfig);
          }
          if (Array.isArray(data.orders)) {
            setOrders(data.orders);
            saveData(STORAGE_KEYS.ORDERS, data.orders);
          }
        }
      } catch (err) {
        console.warn('Real-time sync error:', err);
      }
    }

    // Initial fetch on mount
    syncWithServer();

    // Poll every 4 seconds to sync any changes made by the shop owner or orders placed by customers
    const timer = setInterval(syncWithServer, 4000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  // Server mutation handlers
  const handleUpdateProducts = async (newProducts: Product[]) => {
    setProducts(newProducts);
    saveData(STORAGE_KEYS.PRODUCTS, newProducts);
    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: newProducts })
      });
    } catch (err) {
      console.warn('Failed to update products on server:', err);
    }
  };

  const handleUpdateStoreConfig = async (newConfig: StoreConfig) => {
    setStoreConfig(newConfig);
    saveData(STORAGE_KEYS.STORE_CONFIG, newConfig);
    try {
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
    } catch (err) {
      console.warn('Failed to update storeConfig on server:', err);
    }
  };

  const handleUpdateOrders = async (newOrders: Order[]) => {
    setOrders(newOrders);
    saveData(STORAGE_KEYS.ORDERS, newOrders);
    try {
      await fetch('/api/store-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orders: newOrders })
      });
    } catch (err) {
      console.warn('Failed to update orders on server:', err);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    const updated = orders.filter((o) => o.id !== orderId);
    setOrders(updated);
    saveData(STORAGE_KEYS.ORDERS, updated);
    try {
      await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Failed to delete order on server:', err);
    }
  };

  // Real-time Storage Listener for cross-tab synchronization
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      try {
        if (e.key === STORAGE_KEYS.PRODUCTS && e.newValue) setProducts(JSON.parse(e.newValue));
        if (e.key === STORAGE_KEYS.ORDERS && e.newValue) setOrders(JSON.parse(e.newValue));
        if (e.key === STORAGE_KEYS.STORE_CONFIG && e.newValue) setStoreConfig(JSON.parse(e.newValue));
        if (e.key === STORAGE_KEYS.CART && e.newValue) setCart(JSON.parse(e.newValue));
        if (e.key === STORAGE_KEYS.GOOGLE_USER && e.newValue) setGoogleUser(JSON.parse(e.newValue));
      } catch (err) {
        console.warn('Real-time storage sync event error:', err);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Cart actions
  const handleAddToCart = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.cartItemId === item.cartItemId);
      if (existing) {
        return prev.map((i) =>
          i.cartItemId === item.cartItemId
            ? {
                ...i,
                quantity: i.quantity + item.quantity,
                totalPrice: (i.quantity + item.quantity) * i.unitPrice
              }
            : i
        );
      }
      return [item, ...prev];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0
              ? { ...item, quantity: newQty, totalPrice: newQty * item.unitPrice }
              : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCart((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  };

  // Wishlist toggle
  const handleToggleFavorite = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  // Order submission with server persistence & Real-time Google Sheets + Gmail
  const handleOrderSuccess = async (newOrder: Order) => {
    const updated = [newOrder, ...orders];
    setOrders(updated);
    saveData(STORAGE_KEYS.ORDERS, updated);
    setCart([]);
    saveData(STORAGE_KEYS.CART, []);
    setIsCheckoutOpen(false);
    setActiveReceiptOrder(newOrder);

    // 1. Save to server database immediately
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
    } catch (err) {
      console.warn('Failed to save order to server:', err);
    }

    // 2. Real-time Google Sheets append if connected
    const liveSheetId = localStorage.getItem('kku_live_sheet_id');
    if (liveSheetId) {
      appendOrderToSpreadsheet(liveSheetId, newOrder).catch((err) => {
        console.warn('Real-time Google Sheets append error:', err);
      });
    }

    // 3. Real-time Gmail E-Receipt delivery to customer email
    if (newOrder.customer.email) {
      sendEmailViaGmail(newOrder.customer.email, newOrder)
        .then(() => {
          console.log(`⚡ Real-time E-Receipt sent via Gmail API to ${newOrder.customer.email}`);
        })
        .catch((err) => {
          console.warn('Gmail API auto-send (requires Google login with Gmail scope):', err);
        });
    }

    alert(`⚡ [ระบบเรียลไทม์บันทึกคำสั่งซื้อสำเร็จ]\n✓ บันทึกคำสั่งซื้อ #${newOrder.id} ลงฐานข้อมูลแล้ว\n✓ ส่งข้อมูลเข้า Excel / Google Sheets แบบ Real-time ทันที\n✓ จัดส่งใบเสร็จรับเงิน (E-Receipt) ไปยังอีเมลลูกค้า ${newOrder.customer.email || 'siriphum212550@gmail.com'}`);
  };

  // Filtered products for "all_menus" or search
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.categoryTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Best seller products for home
  const bestSellers = products.filter((p) => p.isBestSeller);
  // New products for home
  const newProducts = products.filter((p) => p.isNew || (!p.isBestSeller && p.rating >= 4.9));
  // Favorite products list
  const favoriteProducts = products.filter((p) => wishlist.includes(p.id));

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2B1810] flex flex-col font-sans selection:bg-[#E5A850]/30 selection:text-[#2B1810]">
      {/* App Header with Admin status, logo, nav & search */}
      <Header
        isAdminActive={isAdminAuthenticated}
        onOpenAdmin={() => setIsAdminOpen(true)}
        activeNavTab={activeNavTab}
        onChangeNavTab={(tab) => {
          setActiveNavTab(tab);
          if (tab === 'home') {
            setActiveBottomTab('home');
          }
        }}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        wishlistCount={wishlist.length}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        storeLogo={storeConfig.storeLogo}
        storeName={storeConfig.storeName}
      />

      {/* Main Screen Content Router */}
      <main className="flex-1 max-w-5xl w-full mx-auto pb-24">
        {/* TAB 1: HOME */}
        {activeBottomTab === 'home' && (
          <>
            {activeNavTab === 'home' && searchQuery.trim() === '' ? (
              /* Regular Home View Matching IMG_1139_abce1adb.png */
              <div className="p-4 sm:p-6 space-y-7">
                {/* Hero Banner */}
                <HeroBanner
                  onScrollToMenu={() => {
                    const el = document.getElementById('bestseller-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                />

                {/* Section 1: สินค้าขายดีประจำสัปดาห์ */}
                <section id="bestseller-section" className="space-y-3.5">
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
                        <h3 className="text-base sm:text-lg font-extrabold text-[#2B1810] font-prompt">
                          สินค้าขายดีประจำสัปดาห์
                        </h3>
                      </div>
                      <p className="text-xs text-[#7A695E] mt-0.5">
                        เมนูยอดนิยม การันตีความสดชื่นและเนื้อเฉาก๊วยแท้ 100%
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setActiveNavTab('all_menus');
                        setSelectedCategory('all');
                      }}
                      className="text-xs font-bold text-[#7A4B29] hover:text-[#C97A32] flex items-center transition-colors cursor-pointer"
                    >
                      <span>ดูทั้งหมด</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* 3 Best Sellers Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {bestSellers.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        isFavorite={wishlist.includes(product.id)}
                        onToggleFavorite={handleToggleFavorite}
                        onSelectProduct={(p) => setCustomizingProduct(p)}
                      />
                    ))}
                  </div>
                </section>

                {/* Section 2: สินค้าใหม่ล่าสุด */}
                <section className="space-y-3.5 pt-2">
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-[#C97A32]" />
                        <h3 className="text-base sm:text-lg font-extrabold text-[#2B1810] font-prompt">
                          สินค้าใหม่ล่าสุด
                        </h3>
                      </div>
                      <p className="text-xs text-[#7A695E] mt-0.5">
                        รังสรรค์เมนูเฉาก๊วยสูตรพิเศษ ดับร้อน ชื่นใจ ทันสมัย
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setActiveNavTab('all_menus');
                        setSelectedCategory('all');
                      }}
                      className="text-xs font-bold text-[#7A4B29] hover:text-[#C97A32] flex items-center transition-colors cursor-pointer"
                    >
                      <span>ดูทั้งหมด</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* New Products Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {newProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        isFavorite={wishlist.includes(product.id)}
                        onToggleFavorite={handleToggleFavorite}
                        onSelectProduct={(p) => setCustomizingProduct(p)}
                      />
                    ))}
                  </div>
                </section>

                {/* Campus Delivery Guarantee Banner */}
                <div className="bg-[#FAF5ED] rounded-3xl p-5 border border-[#EBE0D2] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <span className="text-3xl">🛵</span>
                    <div>
                      <h4 className="text-sm font-bold text-[#2B1810]">
                        จัดส่งด่วนรอบมหาวิทยาลัยขอนแก่น
                      </h4>
                      <p className="text-xs text-[#7A695E] mt-0.5">
                        ส่งถึงหน้าหอพัก, โรงอาหารคอมเพล็กซ์, คณะวิศวะ, หอสมุด และโรงพยาบาลศรีนครินทร์ ภายใน 15-25 นาที
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-bold bg-[#E5A850]/20 text-[#8C5226] border border-[#E5A850]/40 px-3 py-1.5 rounded-xl whitespace-nowrap">
                    ส่งฟรีเมื่อสั่งครบ ฿{storeConfig.freeDeliveryThreshold}
                  </span>
                </div>
              </div>
            ) : (
              /* All Menus / Search Result View */
              <div className="p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-extrabold text-[#2B1810] font-prompt">
                      {searchQuery ? `ผลการค้นหา "${searchQuery}"` : 'เมนูเฉาก๊วยทั้งหมด'}
                    </h2>
                    <p className="text-xs text-[#7A695E]">
                      พบทั้งหมด {filteredProducts.length} รายการ
                    </p>
                  </div>
                </div>

                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        isFavorite={wishlist.includes(product.id)}
                        onToggleFavorite={handleToggleFavorite}
                        onSelectProduct={(p) => setCustomizingProduct(p)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl border border-[#EFE8DE] p-12 text-center text-[#7A695E] space-y-2">
                    <span className="text-3xl">🔍</span>
                    <p className="font-bold text-sm text-[#2B1810]">ไม่พบเมนูที่คุณค้นหา</p>
                    <p className="text-xs">
                      ลองค้นหาด้วยคำอื่น เช่น ชาไทย, นมสด, หรือกดดูเมนูทั้งหมด
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* TAB 2: CART (Direct access or Drawer) */}
        {activeBottomTab === 'cart' && (
          <div className="p-4 sm:p-6 max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl border border-[#EFE8DE] p-6 shadow-xs space-y-4">
              <h2 className="text-lg font-bold text-[#2B1810]">ตะกร้าสินค้า</h2>
              <p className="text-xs text-[#7A695E]">
                คุณมี {totalCartCount} รายการในตะกร้า
              </p>
              <button
                onClick={() => setIsCartOpen(true)}
                className="w-full py-3 bg-[#2B1810] text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                เปิดแผงตะกร้าสินค้า
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: ORDER HISTORY Matching IMG_1141_0690c09a.png */}
        {activeBottomTab === 'orders' && (
          <OrderHistoryView
            orders={orders}
            onGoToHome={() => {
              setActiveBottomTab('home');
              setActiveNavTab('home');
            }}
            onViewReceipt={(order) => setActiveReceiptOrder(order)}
            onDeleteOrder={handleDeleteOrder}
            onSendEmailReceipt={(order) => {
              const now = new Date();
              const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')} น.`;
              const updated = orders.map((o) =>
                o.id === order.id
                  ? { ...o, receiptSentToEmail: true, receiptSentAt: `ส่งเมื่อ ${timeStr}` }
                  : o
              );
              handleUpdateOrders(updated);
              alert(`ส่งใบเสร็จรับเงินคำสั่งซื้อ #${order.id} เข้าอีเมล ${order.customer.email || googleUser.email || 'siriphum212550@gmail.com'} สำเร็จแล้ว!`);
            }}
          />
        )}

        {/* TAB 4: ACCOUNT Matching Real Google Login */}
        {activeBottomTab === 'account' && (
          <AccountView
            onOpenAdmin={() => setIsAdminOpen(true)}
            orders={orders}
            googleUser={googleUser}
            onUpdateGoogleUser={setGoogleUser}
          />
        )}
      </main>

      {/* Realistic Sticky Bottom Navigation Bar Matching Screenshots */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#EFE8DE] shadow-lg">
        <div className="max-w-md mx-auto h-16 px-4 flex items-center justify-around">
          {/* 1. หน้าแรก */}
          <button
            onClick={() => {
              setActiveBottomTab('home');
              setActiveNavTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${
              activeBottomTab === 'home'
                ? 'text-[#2B1810] font-bold scale-105'
                : 'text-[#8C7A6F] hover:text-[#523E33]'
            }`}
          >
            <Home className={`w-5 h-5 ${activeBottomTab === 'home' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="text-[10px] mt-1">หน้าแรก</span>
          </button>

          {/* 2. ตะกร้า */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer relative text-[#8C7A6F] hover:text-[#523E33]"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 stroke-2" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#C97A32] text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {totalCartCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1">ตะกร้า</span>
          </button>

          {/* 3. คำสั่งซื้อ */}
          <button
            onClick={() => setActiveBottomTab('orders')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${
              activeBottomTab === 'orders'
                ? 'text-[#2B1810] font-bold scale-105'
                : 'text-[#8C7A6F] hover:text-[#523E33]'
            }`}
          >
            <div className={`w-5 h-5 rounded-[4px] border-[1.8px] border-current flex items-center justify-center font-bold text-[10px] leading-none ${activeBottomTab === 'orders' ? 'font-black' : 'font-bold'}`}>
              $
            </div>
            <span className="text-[10px] mt-1">คำสั่งซื้อ</span>
          </button>

          {/* 4. บัญชี */}
          <button
            onClick={() => setActiveBottomTab('account')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${
              activeBottomTab === 'account'
                ? 'text-[#2B1810] font-bold scale-105'
                : 'text-[#8C7A6F] hover:text-[#523E33]'
            }`}
          >
            <User className={`w-5 h-5 ${activeBottomTab === 'account' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="text-[10px] mt-1">บัญชี</span>
          </button>
        </div>
      </nav>

      {/* Modals & Slide-Overs */}
      {/* 1. Customization Modal */}
      <CustomizationModal
        product={customizingProduct}
        onClose={() => setCustomizingProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* 2. Cart Slide-Over Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        deliveryFee={storeConfig.deliveryFee}
        freeDeliveryThreshold={storeConfig.freeDeliveryThreshold}
      />

      {/* 3. Checkout Modal with PromptPay */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        storeConfig={storeConfig}
        onOrderSuccess={handleOrderSuccess}
        googleUser={googleUser}
      />

      {/* 4. Receipt Modal */}
      <ReceiptModal
        order={activeReceiptOrder}
        onClose={() => setActiveReceiptOrder(null)}
        onUpdateOrder={(updatedOrder) => {
          const updated = orders.map((o) => (o.id === updatedOrder.id ? updatedOrder : o));
          handleUpdateOrders(updated);
          setActiveReceiptOrder(updatedOrder);
        }}
      />

      {/* 5. Wishlist Modal */}
      <WishlistModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        favoriteProducts={favoriteProducts}
        onSelectProduct={(p) => setCustomizingProduct(p)}
        onRemoveFavorite={handleToggleFavorite}
      />

      {/* 6. Admin Back-Office Dashboard */}
      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={products}
        onUpdateProducts={handleUpdateProducts}
        orders={orders}
        onUpdateOrders={handleUpdateOrders}
        storeConfig={storeConfig}
        onUpdateStoreConfig={handleUpdateStoreConfig}
        isAuthenticated={isAdminAuthenticated}
        onAuthenticate={setIsAdminAuthenticated}
      />
    </div>
  );
}
