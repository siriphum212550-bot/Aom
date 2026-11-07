/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowRight, Sparkles, MapPin, QrCode } from 'lucide-react';

interface HeroBannerProps {
  onScrollToMenu: () => void;
}

export default function HeroBanner({ onScrollToMenu }: HeroBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#2B1810] via-[#361E14] to-[#1E110A] text-white p-6 sm:p-8 shadow-xl border border-[#4A2B1D]">
      {/* Decorative Warm Ambient Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#E5A850]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-[#C97A32]/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Side: Headlines & Badges */}
        <div className="space-y-4 max-w-xl">
          {/* Top Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-[#E69539] text-[#1E110A] text-xs font-black px-3 py-1 rounded-full shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>KKU OFFICIAL STORE</span>
            </span>

            <span className="inline-flex items-center gap-1 bg-white/10 backdrop-blur-xs text-[#EAE0D5] text-xs font-medium px-3 py-1 rounded-full border border-white/10">
              <MapPin className="w-3.5 h-3.5 text-amber-300" />
              <span>มหาวิทยาลัยขอนแก่น</span>
            </span>
          </div>

          {/* Headline */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight font-prompt">
            ยินดีต้อนรับสู่ <br className="hidden sm:inline" />
            <span className="text-white">ร้านน้ำเฉาก๊วย kku</span>
          </h2>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-[#D6C2B4] leading-relaxed">
            น้ำเฉาก๊วยต้มสดและขนมหวานสมุนไพรพรีเมียม หอมกลิ่นใบชาโบราณ เนื้อหนึบหนับเคี้ยวเพลิน ดับร้อนทันใจ สูตรแท้ส่งตรงถึงชาว มข.
          </p>

          {/* Feature Badges matching Screenshot */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="bg-black/35 backdrop-blur-xs border border-white/10 px-3 py-1.5 rounded-xl text-[#F2ECE3] flex items-center gap-1.5">
              <span>🌿</span>
              <span>ใบเฉาก๊วยแท้ 100%</span>
            </span>

            <span className="bg-black/35 backdrop-blur-xs border border-white/10 px-3 py-1.5 rounded-xl text-[#F2ECE3] flex items-center gap-1.5">
              <span>✨</span>
              <span>สองไซส์ ธรรมดา / พิเศษ</span>
            </span>

            <span className="bg-black/35 backdrop-blur-xs border border-white/10 px-3 py-1.5 rounded-xl text-[#F2ECE3] flex items-center gap-1.5">
              <QrCode className="w-3.5 h-3.5 text-amber-300" />
              <span>พร้อมเพย์ QR ร้านค้า</span>
            </span>
          </div>
        </div>

        {/* Right Side: CTA Button Card matching Screenshot */}
        <div className="flex flex-col items-center md:items-end justify-center shrink-0">
          <button
            onClick={onScrollToMenu}
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-[#E5A850] hover:bg-[#F3BA6A] text-[#2B1810] font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-102 active:scale-98 cursor-pointer"
          >
            <span>เลือกสั่งซื้อเมนูเฉาก๊วย</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-[11px] text-[#C2AEA0] mt-2.5 font-medium text-center md:text-right">
            จัดส่งรวดเร็วรอบ มข. · สั่งง่ายใน 1 นาที
          </p>
        </div>
      </div>
    </div>
  );
}
