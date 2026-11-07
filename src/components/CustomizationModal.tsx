/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Minus, Plus } from 'lucide-react';
import { Product, Topping, CartItem } from '../types';
import { AVAILABLE_TOPPINGS, SWEETNESS_LEVELS } from '../data';

interface CustomizationModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
}

export default function CustomizationModal({
  product,
  onClose,
  onAddToCart
}: CustomizationModalProps) {
  if (!product) return null;

  const [sizeType, setSizeType] = useState<'ธรรมดา' | 'พิเศษ'>('ธรรมดา');
  const [sweetness, setSweetness] = useState<string>('หวานกลมกล่อม 50%');
  const [selectedToppings, setSelectedToppings] = useState<Topping[]>([]);
  const [quantity, setQuantity] = useState<number>(1);

  const basePrice = sizeType === 'ธรรมดา' ? product.priceNormal : product.priceSpecial;
  const toppingsTotal = selectedToppings.reduce((sum, t) => sum + t.price, 0);
  const unitPrice = basePrice + toppingsTotal;
  const totalPrice = unitPrice * quantity;

  const toggleTopping = (topping: Topping) => {
    if (selectedToppings.some((t) => t.id === topping.id)) {
      setSelectedToppings(selectedToppings.filter((t) => t.id !== topping.id));
    } else {
      setSelectedToppings([...selectedToppings, topping]);
    }
  };

  const handleConfirm = () => {
    const cartItemId = `${product.id}-${sizeType}-${sweetness}-${selectedToppings
      .map((t) => t.id)
      .sort()
      .join('-')}`;

    const item: CartItem = {
      cartItemId,
      productId: product.id,
      name: product.name,
      nameEn: product.nameEn,
      image: product.image,
      sizeType,
      sweetness,
      toppings: selectedToppings,
      unitPrice,
      quantity,
      totalPrice
    };

    onAddToCart(item);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative w-full max-w-lg bg-[#FAF8F5] rounded-[28px] shadow-2xl border border-[#EFE8DE] overflow-hidden my-4 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Body Header matching IMG_1204_40fe4bf1.png */}
        <div className="p-6 pb-4 space-y-2 border-b border-[#EFE8DE] bg-[#FAF8F5]">
          <h2 className="text-xl sm:text-2xl font-black text-[#2B1810] tracking-tight font-prompt">
            {product.name}
          </h2>
          {product.nameEn && (
            <p className="text-xs font-medium text-slate-500 font-sans">
              {product.nameEn}
            </p>
          )}
          <p className="text-xs text-slate-600 leading-relaxed pt-1">
            {product.description}
          </p>
        </div>

        {/* Scrollable Customization Options */}
        <div className="p-6 pt-4 overflow-y-auto space-y-5 flex-1 text-[#2B1810]">
          {/* 1. เลือกขนาด / รูปแบบ (Size & Type) matching Screenshot */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-[#2B1810]">
              เลือกขนาด / รูปแบบ (Size & Type)
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {/* ธรรมดา (Regular) */}
              <button
                type="button"
                onClick={() => setSizeType('ธรรมดา')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex justify-between items-center ${
                  sizeType === 'ธรรมดา'
                    ? 'bg-[#2B1810] text-white border-[#2B1810] shadow-sm'
                    : 'bg-white border-[#E5DACF] text-[#2B1810] hover:bg-[#FAF7F2]'
                }`}
              >
                <div>
                  <p className="font-bold text-xs sm:text-sm">ธรรมดา (Regular)</p>
                  <p className={`text-[11px] mt-0.5 ${sizeType === 'ธรรมดา' ? 'text-slate-300' : 'text-slate-500'}`}>
                    ปริมาณมาตรฐาน อิ่มพอดี
                  </p>
                </div>
                <span className={`font-extrabold text-sm font-prompt ${sizeType === 'ธรรมดา' ? 'text-amber-300' : 'text-[#2B1810]'}`}>
                  ฿{product.priceNormal}
                </span>
              </button>

              {/* พิเศษ (Special) */}
              <button
                type="button"
                onClick={() => setSizeType('พิเศษ')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex justify-between items-center ${
                  sizeType === 'พิเศษ'
                    ? 'bg-[#2B1810] text-white border-[#2B1810] shadow-sm'
                    : 'bg-white border-[#E5DACF] text-[#2B1810] hover:bg-[#FAF7F2]'
                }`}
              >
                <div>
                  <p className="font-bold text-xs sm:text-sm">พิเศษ (Special)</p>
                  <p className={`text-[11px] mt-0.5 ${sizeType === 'พิเศษ' ? 'text-slate-300' : 'text-slate-500'}`}>
                    เพิ่มเนื้อเฉาก๊วยและเครื่องจุใจ
                  </p>
                </div>
                <span className={`font-extrabold text-sm font-prompt ${sizeType === 'พิเศษ' ? 'text-amber-300' : 'text-[#8C5226]'}`}>
                  +฿{product.priceSpecial - product.priceNormal}
                </span>
              </button>
            </div>
          </div>

          {/* 2. ระดับความหวาน (Sweetness) 2x2 grid matching Screenshot */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-[#2B1810]">
              ระดับความหวาน (Sweetness)
            </h3>

            <div className="grid grid-cols-2 gap-2.5">
              {SWEETNESS_LEVELS.map((level) => {
                const isSelected = sweetness === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setSweetness(level)}
                    className={`py-3 px-4 rounded-2xl text-xs font-semibold text-center border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#2B1810] text-white border-[#2B1810] shadow-xs'
                        : 'bg-white border-[#E5DACF] text-[#2B1810] hover:bg-[#FAF7F2]'
                    }`}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. เพิ่มท็อปปิ้งสมุนไพรพรีเมียม (เลือกได้หลายอย่าง) matching Screenshot */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-[#2B1810]">
              เพิ่มท็อปปิ้งสมุนไพรพรีเมียม (เลือกได้หลายอย่าง)
            </h3>

            <div className="space-y-2">
              {AVAILABLE_TOPPINGS.map((top) => {
                const isChecked = selectedToppings.some((t) => t.id === top.id);
                return (
                  <button
                    key={top.id}
                    type="button"
                    onClick={() => toggleTopping(top)}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between text-xs transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-[#FAF5EE] border-[#C97A32] text-[#2B1810] font-bold ring-1 ring-[#C97A32]/30'
                        : 'bg-white border-[#E5DACF] text-[#2B1810] hover:bg-[#FAF7F2]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          isChecked
                            ? 'bg-[#2B1810] border-[#2B1810] text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isChecked && <span className="w-2 h-2 rounded-full bg-white"></span>}
                      </div>
                      <span className="text-xs">{top.name}</span>
                    </div>

                    <span className="font-bold text-[#8C5226] font-prompt">
                      {top.price === 0 ? 'ฟรี (฿0)' : `+฿${top.price}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer with Stepper & Add to Cart Button matching IMG_1204_40fe4bf1.png */}
        <div className="p-4 sm:p-5 bg-[#FAF8F5] border-t border-[#EFE8DE] flex items-center justify-between gap-3 shrink-0">
          {/* Stepper matching [ - 1 + ] */}
          <div className="flex items-center bg-white border border-[#E5DACF] rounded-2xl p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-[#523E33] hover:bg-[#F2ECE3] active:scale-95 transition-all cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-bold text-sm text-[#2B1810]">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-[#523E33] hover:bg-[#F2ECE3] active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart button matching: เพิ่มลงตะกร้า · ฿55 */}
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-3.5 px-6 rounded-2xl bg-[#2B1810] hover:bg-[#3D2317] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-98 shadow-md cursor-pointer"
          >
            <span>เพิ่มลงตะกร้า</span>
            <span>·</span>
            <span className="font-prompt text-base">฿{totalPrice}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
