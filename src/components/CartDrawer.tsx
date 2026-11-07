/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShoppingBag, X, Trash2, Minus, Plus, ArrowRight } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (cartItemId: string, delta: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onProceedToCheckout: () => void;
  deliveryFee: number;
  freeDeliveryThreshold: number;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  deliveryFee,
  freeDeliveryThreshold
}: CartDrawerProps) {
  if (!isOpen) return null;

  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const isFreeDelivery = subtotal >= freeDeliveryThreshold && cart.length > 0;
  const actualDeliveryFee = cart.length === 0 ? 0 : isFreeDelivery ? 0 : deliveryFee;
  const grandTotal = subtotal + actualDeliveryFee;
  const remainingForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-right duration-250">
        {/* Drawer Header */}
        <div className="p-4 border-b border-[#EFE8DE] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2B1810] text-amber-200 flex items-center justify-center shadow-xs">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#2B1810]">ตะกร้าสินค้าของคุณ</h2>
              <p className="text-xs text-[#8C7A6F]">({totalItemsCount} รายการ)</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FAF7F2] hover:bg-[#F2ECE3] text-[#7A695E] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Free Delivery Banner matching screenshot */}
        <div className="px-4 py-2.5 bg-[#FEF9EE] border-b border-[#F7EACD]">
          {isFreeDelivery ? (
            <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
              <span>🎉</span>
              <span>ยินดีด้วย! ออเดอร์ของคุณได้รับสิทธิ์จัดส่งฟรี</span>
            </p>
          ) : (
            <p className="text-xs font-medium text-[#8C5226] flex items-center gap-1.5">
              <span>🛵</span>
              <span>
                สั่งเพิ่มอีก <strong className="font-bold text-[#C97A32]">฿{remainingForFreeDelivery}</strong> เพื่อรับสิทธิ์จัดส่งฟรีใน มข.!
              </span>
            </p>
          )}
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length > 0 ? (
            cart.map((item) => (
              <div
                key={item.cartItemId}
                className="bg-white rounded-2xl border border-[#EFE8DE] p-3 shadow-xs flex gap-3 relative group"
              >
                {/* Product Thumbnail */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 rounded-xl object-cover shrink-0 bg-[#F2ECE3]"
                />

                {/* Details */}
                <div className="flex-1 min-w-0 pr-6">
                  <h4 className="text-xs font-bold text-[#2B1810] truncate">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-[#7A695E] mt-0.5 line-clamp-1">
                    {item.sizeType} · {item.sweetness}
                  </p>
                  {item.toppings.length > 0 && (
                    <p className="text-[10px] text-[#9A6237] mt-0.5 truncate">
                      +{item.toppings.map((t) => t.name).join(', ')}
                    </p>
                  )}
                  {item.note && (
                    <p className="text-[10px] text-slate-400 italic truncate">
                      โน้ต: {item.note}
                    </p>
                  )}

                  {/* Price & Stepper Row */}
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-extrabold text-sm text-[#2B1810] font-prompt">
                      ฿{item.totalPrice}
                    </span>

                    {/* Stepper matching screenshot */}
                    <div className="flex items-center bg-[#FAF7F2] border border-[#E5DACF] rounded-lg p-0.5">
                      <button
                        onClick={() => onUpdateQuantity(item.cartItemId, -1)}
                        className="w-6 h-6 flex items-center justify-center text-[#7A695E] hover:text-[#2B1810] transition-colors cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-[#2B1810]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.cartItemId, 1)}
                        className="w-6 h-6 flex items-center justify-center text-[#7A695E] hover:text-[#2B1810] transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Trash Button */}
                <button
                  onClick={() => onRemoveItem(item.cartItemId)}
                  className="absolute top-3 right-3 text-[#B0A094] hover:text-red-500 transition-colors cursor-pointer"
                  title="ลบรายการนี้"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#9C8A7E] space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#FAF7F2] flex items-center justify-center text-3xl">
                🥤
              </div>
              <div>
                <p className="font-bold text-sm text-[#523E33]">ตะกร้าของคุณยังว่างเปล่า</p>
                <p className="text-xs text-[#8C7A6F] mt-1">
                  เลือกเครื่องดื่มเฉาก๊วยชื่นใจสูตรแท้ มข. เพิ่มลงในตะกร้าได้เลย!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Summary & Checkout Button */}
        {cart.length > 0 && (
          <div className="p-4 bg-[#FAF7F2] border-t border-[#EFE8DE] space-y-3">
            <div className="space-y-1.5 text-xs text-[#7A695E]">
              <div className="flex justify-between">
                <span>ยอดรวมสินค้า:</span>
                <span className="font-bold text-[#2B1810]">฿{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>ค่าจัดส่ง:</span>
                <span className={`font-bold ${actualDeliveryFee === 0 ? 'text-emerald-600' : 'text-[#2B1810]'}`}>
                  {actualDeliveryFee === 0 ? 'ฟรี' : `฿${actualDeliveryFee}`}
                </span>
              </div>
              <div className="pt-2 border-t border-[#E5DACF] flex justify-between text-base font-extrabold text-[#2B1810]">
                <span>ยอดรวมทั้งสิ้น:</span>
                <span className="text-xl font-prompt text-[#2B1810]">฿{grandTotal}</span>
              </div>
            </div>

            <button
              onClick={onProceedToCheckout}
              className="w-full py-3.5 px-4 rounded-xl bg-[#2B1810] hover:bg-[#3D2317] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer active:scale-98"
            >
              <span>ดำเนินการสั่งซื้อ</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
