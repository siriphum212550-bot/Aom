/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Crown, Heart, ShoppingBag, ShieldCheck, ArrowRight, Search, X } from 'lucide-react';
import ChaoKuayMascot from './ChaoKuayMascot';

interface HeaderProps {
  isAdminActive: boolean;
  onOpenAdmin: () => void;
  activeNavTab: 'home' | 'all_menus';
  onChangeNavTab: (tab: 'home' | 'all_menus') => void;
  cartCount: number;
  onOpenCart: () => void;
  wishlistCount: number;
  onOpenWishlist: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  storeLogo?: string;
  storeName?: string;
}

export default function Header({
  isAdminActive,
  onOpenAdmin,
  activeNavTab,
  onChangeNavTab,
  cartCount,
  onOpenCart,
  wishlistCount,
  onOpenWishlist,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  storeLogo,
  storeName
}: HeaderProps) {
  const categories = [
    { id: 'all', label: 'ทั้งหมด' },
    { id: 'classic', label: 'สูตรดั้งเดิม' },
    { id: 'milk_tea', label: 'ผสมนมสด & ชา' },
    { id: 'bowls', label: 'ทรงเครื่อง & ชาม' },
    { id: 'specials', label: 'เมนูพิเศษ' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#EFE8DE] shadow-xs">
      {/* Admin Session Active Bar */}
      {isAdminActive && (
        <div className="bg-[#1A130E] text-white text-[11px] sm:text-xs py-1.5 px-4 flex items-center justify-between border-b border-[#3D281C]">
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>โหมดผู้ดูแลระบบกำลังทำงาน (Admin Session Active)</span>
          </div>
          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1 text-[#E5A850] hover:text-[#F3BA6A] font-semibold transition-colors cursor-pointer"
          >
            <span>เปิดแดชบอร์ดหลังบ้าน</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Top Header */}
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Brand Logo & Info */}
        <div
          onClick={() => onChangeNavTab('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          {storeLogo ? (
            <img
              src={storeLogo}
              alt="โลโก้โปรไฟล์ร้านค้า"
              className="w-12 h-12 rounded-2xl object-cover border-2 border-[#E9DCCF] shadow-sm bg-white shrink-0 group-hover:scale-105 transition-transform"
            />
          ) : (
            <ChaoKuayMascot size={46} />
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold text-[#2B1810] tracking-tight group-hover:text-[#4A2818] transition-colors font-prompt">
                {storeName || 'ร้านน้ำเฉาก๊วย KKU'}
              </h1>
              <span className="bg-[#F4ECE1] text-[#7A4B29] text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border border-[#E9DCCF]">
                CHAOKUAY
              </span>
            </div>
            <p className="text-xs text-[#7A695E] font-medium">
              เฉาก๊วยสมุนไพรแท้ มหาวิทยาลัยขอนแก่น
            </p>
          </div>
        </div>

        {/* Action Buttons: Crown (Admin/VIP), Heart (Wishlist), Shopping Bag (Cart) */}
        <div className="flex items-center gap-2">
          {/* Admin Crown Button */}
          <button
            onClick={onOpenAdmin}
            title="ระบบจัดการร้านค้า (Admin)"
            className="w-10 h-10 rounded-full bg-[#2B1810] hover:bg-[#3E2317] text-[#E5A850] flex items-center justify-center transition-all hover:scale-105 shadow-xs border border-[#4D2E1E] cursor-pointer"
          >
            <Crown className="w-5 h-5 fill-[#E5A850]/20" />
          </button>

          {/* Wishlist Button */}
          <button
            onClick={onOpenWishlist}
            title="รายการที่ถูกใจ"
            className="w-10 h-10 rounded-full bg-white hover:bg-[#F5EFE6] text-[#7A4B29] border border-[#E5DACF] flex items-center justify-center transition-all hover:scale-105 shadow-xs cursor-pointer relative"
          >
            <Heart className={`w-5 h-5 ${wishlistCount > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Shopping Bag Button */}
          <button
            onClick={onOpenCart}
            title="ตะกร้าสินค้า"
            className="w-10 h-10 rounded-xl bg-[#2B1810] hover:bg-[#3E2317] text-white flex items-center justify-center transition-all hover:scale-105 shadow-sm border border-[#3E2317] cursor-pointer relative"
          >
            <ShoppingBag className="w-5 h-5 text-amber-100" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#C97A32] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Sub Navigation Bar: [หน้าแรก] [เมนูทั้งหมด] + Search Bar */}
      <div className="max-w-5xl mx-auto px-4 pb-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              onChangeNavTab('home');
              onSearchChange('');
            }}
            className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeNavTab === 'home'
                ? 'bg-[#2B1810] text-white shadow-xs'
                : 'bg-white text-[#523E33] border border-[#E5DACF] hover:bg-[#F5EFE6]'
            }`}
          >
            หน้าแรก
          </button>
          <button
            onClick={() => onChangeNavTab('all_menus')}
            className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeNavTab === 'all_menus'
                ? 'bg-[#2B1810] text-white shadow-xs'
                : 'bg-white text-[#523E33] border border-[#E5DACF] hover:bg-[#F5EFE6]'
            }`}
          >
            เมนูทั้งหมด
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-xs min-w-[200px]">
          <Search className="w-4 h-4 text-[#9C8A7E] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              onSearchChange(e.target.value);
              if (e.target.value.trim().length > 0 && activeNavTab !== 'all_menus') {
                onChangeNavTab('all_menus');
              }
            }}
            placeholder="ค้นหาเมนูเฉาก๊วย, ชาไทย, นมสด..."
            className="w-full pl-9 pr-8 py-1.5 bg-white border border-[#E5DACF] rounded-full text-xs text-[#2B1810] placeholder-[#A49488] focus:outline-none focus:ring-2 focus:ring-[#C97A32]/40 focus:border-[#C97A32] shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9C8A7E] hover:text-[#523E33]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Category Pills (Visible when in all_menus) */}
      {activeNavTab === 'all_menus' && (
        <div className="max-w-5xl mx-auto px-4 pb-2.5 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#E5A850] text-[#2B1810] font-bold shadow-2xs'
                  : 'bg-[#F2ECE3] text-[#7A695E] hover:bg-[#EBE2D7]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
