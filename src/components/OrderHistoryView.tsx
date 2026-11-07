/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Package, Clock, CheckCircle, Truck, XCircle, ChevronRight, MapPin, Receipt, Trash2, Mail, CheckCircle2 } from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { exportOrdersToExcel } from '../utils/excelExport';

interface OrderHistoryViewProps {
  orders: Order[];
  onGoToHome: () => void;
  onViewReceipt: (order: Order) => void;
  onDeleteOrder?: (orderId: string) => void;
  onSendEmailReceipt?: (order: Order) => void;
}

export default function OrderHistoryView({
  orders,
  onGoToHome,
  onViewReceipt,
  onDeleteOrder,
  onSendEmailReceipt
}: OrderHistoryViewProps) {
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'รอตรวจสอบ':
        return (
          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>รอตรวจสอบ</span>
          </span>
        );
      case 'กำลังจัดเตรียม':
        return (
          <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-blue-200">
            <Package className="w-3 h-3 text-blue-600" />
            <span>กำลังจัดเตรียม</span>
          </span>
        );
      case 'กำลังจัดส่ง':
        return (
          <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-purple-200">
            <Truck className="w-3 h-3 text-purple-600" />
            <span>กำลังจัดส่ง</span>
          </span>
        );
      case 'สำเร็จ':
        return (
          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            <span>จัดส่งสำเร็จ</span>
          </span>
        );
      case 'ยกเลิก':
        return (
          <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            <span>ยกเลิกแล้ว</span>
          </span>
        );
    }
  };

  const handleDelete = (orderId: string) => {
    if (confirm(`คุณต้องการลบข้อมูลคำสั่งซื้อ #${orderId} ใช่หรือไม่?`)) {
      onDeleteOrder?.(orderId);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Top Title & Subtitle matching Screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#2B1810] font-prompt">
            ประวัติคำสั่งซื้อของฉัน
          </h2>
          <p className="text-xs sm:text-sm text-[#7A695E] mt-0.5">
            ติดตามสถานะและซิงก์ข้อมูลออเดอร์กับ Google Sheets / Excel
          </p>
        </div>

        <div className="flex items-center gap-2">
          {orders.length > 0 && (
            <button
              onClick={() => exportOrdersToExcel(orders, 'ChaoKuay_KKU_Orders')}
              className="px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <span>ส่งออกไป Excel</span>
            </button>
          )}

          <span className="bg-[#EFE8DE] text-[#523E33] text-xs font-bold px-3.5 py-1 rounded-full border border-[#E2D5C7]">
            {orders.length} ออเดอร์
          </span>
        </div>
      </div>

      {/* Main Container */}
      {orders.length === 0 ? (
        /* Empty State Matching Screenshot 2 exactly */
        <div className="bg-white rounded-3xl border border-[#EFE8DE] p-10 sm:p-14 text-center shadow-xs flex flex-col items-center justify-center space-y-4">
          {/* Box Icon Container */}
          <div className="w-20 h-20 rounded-2xl bg-[#F8F4EE] flex items-center justify-center text-4xl shadow-inner border border-[#EFE8DE]">
            📦
          </div>

          <div className="space-y-1.5 max-w-sm">
            <h3 className="text-lg font-bold text-[#2B1810]">
              ยังไม่มีประวัติคำสั่งซื้อ
            </h3>
            <p className="text-xs text-[#7A695E] leading-relaxed">
              คุณยังไม่ได้สั่งซื้อน้ำเฉาก๊วยพรีเมียม ลองเลือกเครื่องดื่มเฉาก๊วยสูตรดั้งเดิม หรือสูตรน้ำผึ้งยอดนิยมได้เลย
            </p>
          </div>

          <button
            onClick={onGoToHome}
            className="px-6 py-2.5 rounded-xl bg-[#2B1810] hover:bg-[#3E2317] text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
          >
            ไปหน้าแรกและเลือกซื้อ
          </button>
        </div>
      ) : (
        /* Orders List */
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-[#EFE8DE] p-4 sm:p-5 shadow-xs hover:shadow-md transition-all space-y-3.5"
            >
              {/* Order Top Bar: ID, Date, Status & Delete button */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#F5EFE8]">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-[#2B1810] font-mono">
                    #{order.id}
                  </span>
                  <span className="text-xs text-[#9C8A7E]">· {order.createdAt}</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(order.status)}
                  {onDeleteOrder && (
                    <button
                      onClick={() => handleDelete(order.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="ลบคำสั่งซื้อนี้"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Items Summary */}
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.cartItemId} className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-xl object-cover shrink-0 bg-[#F2ECE3]"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#2B1810] truncate">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-[#7A695E] truncate">
                        {item.sizeType} · {item.sweetness} x{item.quantity}
                      </p>
                      {item.toppings.length > 0 && (
                        <p className="text-[10px] text-[#8C5226] truncate">
                          +{item.toppings.map((t) => t.name).join(', ')}
                        </p>
                      )}
                    </div>
                    <span className="text-xs font-bold text-[#2B1810] shrink-0 font-prompt">
                      ฿{item.totalPrice}
                    </span>
                  </div>
                ))}
              </div>

              {/* Location, GPS Link, Email & Payment info */}
              <div className="bg-[#FAF8F5] p-3 rounded-xl text-[11px] text-[#7A695E] space-y-1.5 border border-[#EFE8DE]">
                {order.customer.gpsLink && (
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-[#2B1810]">
                      <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      <span>พิกัด GPS จัดส่ง:</span>
                    </div>
                    <a
                      href={order.customer.gpsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-0.5 rounded-lg transition-colors cursor-pointer"
                    >
                      <span>🗺️ เปิดนำทางบน Google Maps</span>
                      <span className="text-[9px]">↗</span>
                    </a>
                  </div>
                )}

                {order.customer.location && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#8C7A6F]">จุดนัดรับ:</span>
                    <strong className="text-[#2B1810]">{order.customer.location}</strong>
                  </div>
                )}

                {order.customer.note && (
                  <div className="text-amber-800">
                    <span>โน้ต: </span>
                    <strong>{order.customer.note}</strong>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#F2ECE3] text-[10px]">
                  {order.customer.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-[#7A695E] shrink-0" />
                      <span>อีเมล: <strong className="text-[#2B1810]">{order.customer.email}</strong></span>
                    </div>
                  )}
                  <span className="text-slate-600">
                    ชำระโดย: <strong>{order.paymentMethod === 'promptpay' ? 'โอนพร้อมเพย์ QR' : 'ชำระสด / สแกนตอนรับ'}</strong>
                  </span>
                </div>
              </div>

              {/* Order Footer with Total & Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#F5EFE8]">
                <div className="text-xs text-[#7A695E]">
                  ยอดรวมทั้งหมด:{' '}
                  <span className="text-base font-extrabold text-[#2B1810] font-prompt ml-1">
                    ฿{order.total}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Email receipt button */}
                  {order.receiptSentToEmail ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-xl flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>ส่งใบเสร็จแล้ว</span>
                    </span>
                  ) : onSendEmailReceipt ? (
                    <button
                      onClick={() => onSendEmailReceipt(order)}
                      className="px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="ส่งใบเสร็จรับเงินเข้าอีเมล"
                    >
                      <Mail className="w-3.5 h-3.5 text-emerald-600" />
                      <span>ส่งเข้าอีเมล</span>
                    </button>
                  ) : null}

                  <button
                    onClick={() => onViewReceipt(order)}
                    className="px-3.5 py-1.5 rounded-xl border border-[#E5DACF] bg-white hover:bg-[#FAF7F2] text-[#523E33] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Receipt className="w-3.5 h-3.5 text-[#C97A32]" />
                    <span>ดูใบเสร็จ</span>
                  </button>

                  <button
                    onClick={onGoToHome}
                    className="px-3.5 py-1.5 rounded-xl bg-[#2B1810] hover:bg-[#3E2317] text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    สั่งอีกครั้ง
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
