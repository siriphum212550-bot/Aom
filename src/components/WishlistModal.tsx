/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Heart, Plus, Trash2 } from 'lucide-react';
import { Product } from '../types';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  favoriteProducts: Product[];
  onSelectProduct: (product: Product) => void;
  onRemoveFavorite: (productId: string) => void;
}

export default function WishlistModal({
  isOpen,
  onClose,
  favoriteProducts,
  onSelectProduct,
  onRemoveFavorite
}: WishlistModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#EFE8DE] overflow-hidden my-4 max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 bg-[#FAF7F2] border-b border-[#EFE8DE] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Heart className="w-4 h-4 fill-rose-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#2B1810]">รายการที่ถูกใจ (Wishlist)</h3>
              <p className="text-[10px] text-[#7A695E]">({favoriteProducts.length} รายการ)</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-[#F2ECE3] text-[#7A695E] flex items-center justify-center border border-[#E5DACF] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {favoriteProducts.length > 0 ? (
            favoriteProducts.map((prod) => (
              <div
                key={prod.id}
                className="bg-white rounded-2xl border border-[#EFE8DE] p-3 flex items-center gap-3 shadow-2xs hover:shadow-xs transition-shadow"
              >
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="w-14 h-14 rounded-xl object-cover shrink-0 bg-[#F2ECE3]"
                />

                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-[#2B1810] truncate">
                    {prod.name}
                  </h4>
                  <p className="text-[10px] text-[#8C5226] mt-0.5">
                    {prod.categoryTag}
                  </p>
                  <p className="font-extrabold text-xs text-[#2B1810] font-prompt mt-1">
                    ฿{prod.priceNormal}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      onClose();
                      onSelectProduct(prod);
                    }}
                    className="p-2 rounded-xl bg-[#2B1810] text-white hover:bg-[#3E2317] transition-colors cursor-pointer"
                    title="เลือกเพื่อใส่ตะกร้า"
                  >
                    <Plus className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onRemoveFavorite(prod.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                    title="ลบออกจากที่ถูกใจ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-center p-6 text-[#9C8A7E] space-y-2">
              <Heart className="w-10 h-10 text-slate-300" />
              <p className="text-xs font-bold text-[#523E33]">ยังไม่มีเมนูที่ถูกใจ</p>
              <p className="text-[11px] text-[#8C7A6F]">
                กดรูปหัวใจบนการ์ดเมนูเพื่อบันทึกรายการโปรดของคุณ
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
