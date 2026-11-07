/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, CheckCircle, Copy, Check, MapPin, Phone, Clock, FileText, Mail, Send, ExternalLink, Printer } from 'lucide-react';
import { Order } from '../types';

interface ReceiptModalProps {
  order: Order | null;
  onClose: () => void;
  onUpdateOrder?: (order: Order) => void;
}

export default function ReceiptModal({ order, onClose, onUpdateOrder }: ReceiptModalProps) {
  const [copied, setCopied] = useState(false);
  const [emailInput, setEmailInput] = useState(order?.customer.email || 'siriphum212550@gmail.com');
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(order?.receiptSentToEmail || false);
  const [sentMessage, setSentMessage] = useState<string | null>(
    order?.receiptSentAt ? `ส่งเข้าอีเมลแล้ว (${order.receiptSentAt})` : null
  );
  const [showEmailPreview, setShowEmailPreview] = useState(false);

  if (!order) return null;

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(order.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendEmail = () => {
    if (!emailInput.trim()) {
      alert('กรุณากรอกอีเมลสำหรับรับใบเสร็จ');
      return;
    }

    const now = new Date();
    const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')} น.`;

    setEmailSent(true);
    setSentMessage(`ส่งเข้าอีเมล ${emailInput} เรียบร้อยแล้ว (${timeStr})`);
    setIsEditingEmail(false);

    if (onUpdateOrder) {
      onUpdateOrder({
        ...order,
        customer: { ...order.customer, email: emailInput },
        receiptSentToEmail: true,
        receiptSentAt: timeStr
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#EFE8DE] overflow-hidden my-4 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 bg-[#FAF7F2] border-b border-[#EFE8DE] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#2B1810]">ใบเสร็จรับเงิน (E-Receipt)</h3>
              <p className="text-[10px] text-[#7A695E]">ร้านน้ำเฉาก๊วย KKU · มหาวิทยาลัยขอนแก่น</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-[#F2ECE3] text-[#7A695E] flex items-center justify-center border border-[#E5DACF] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Receipt Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-[#2B1810]">
          {/* Order ID Banner */}
          <div className="bg-[#FAF5EE] border border-[#E5DACF] rounded-2xl p-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#7A695E] block">หมายเลขคำสั่งซื้อ:</span>
              <span className="font-mono font-extrabold text-sm text-[#2B1810]">
                #{order.id}
              </span>
            </div>
            <button
              onClick={handleCopyOrderId}
              className="px-2.5 py-1 rounded-lg bg-white border border-[#E5DACF] text-[11px] font-bold text-[#523E33] flex items-center gap-1 hover:bg-[#FAF7F2] transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอกเลข'}</span>
            </button>
          </div>

          {/* Email Receipt Delivery Box */}
          <div className="bg-[#F3F8F2] border border-[#D1E7CE] rounded-2xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                <Mail className="w-4 h-4 text-emerald-600" />
                <span>ใบเสร็จรับเงินทางอีเมล (E-Receipt Delivery)</span>
              </div>
              <button
                type="button"
                onClick={() => setShowEmailPreview(true)}
                className="text-[10px] text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-0.5 underline cursor-pointer"
              >
                <span>ดูตัวอย่างอีเมล</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            {isEditingEmail ? (
              <div className="flex gap-2">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="name@kkumail.com"
                  className="flex-1 px-2.5 py-1.5 bg-white border border-emerald-300 rounded-xl text-xs"
                />
                <button
                  type="button"
                  onClick={handleSendEmail}
                  className="px-3 py-1.5 bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  <span>ส่งเลย</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between text-[11px] pt-0.5">
                <span className="text-[#3F593A] truncate">
                  ส่งถึง: <strong className="font-mono text-emerald-900">{emailInput}</strong>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingEmail(true)}
                    className="text-[10px] text-emerald-700 hover:text-emerald-900 underline font-semibold cursor-pointer"
                  >
                    เปลี่ยนอีเมล
                  </button>
                  <button
                    type="button"
                    onClick={handleSendEmail}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    <span>{emailSent ? 'ส่งอีกครั้ง' : 'ส่งใบเสร็จ'}</span>
                  </button>
                </div>
              </div>
            )}

            {sentMessage && (
              <p className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 pt-0.5">
                <Check className="w-3 h-3" />
                <span>{sentMessage}</span>
              </p>
            )}
          </div>

          {/* Date & Status */}
          <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#FAF7F2] p-3 rounded-xl border border-[#EFE8DE]">
            <div>
              <span className="text-[#8C7A6F] block">วันเวลาที่สั่ง:</span>
              <strong className="text-[#2B1810]">{order.createdAt}</strong>
            </div>
            <div>
              <span className="text-[#8C7A6F] block">สถานะปัจจุบัน:</span>
              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                {order.status}
              </span>
            </div>
          </div>

          {/* Customer & Location */}
          <div className="space-y-1.5 p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EFE8DE] text-[11px]">
            <p><strong>ผู้รับ:</strong> {order.customer.name} ({order.customer.phone})</p>
            {order.customer.gpsLink && (
              <div className="flex flex-wrap items-center justify-between gap-1 pt-0.5">
                <span className="font-bold text-[#2B1810]">พิกัด GPS จัดส่ง:</span>
                <a
                  href={order.customer.gpsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-lg hover:underline font-bold"
                >
                  <MapPin className="w-3 h-3 text-red-500" />
                  <span>เปิดดูตำแหน่งบน Google Maps</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            )}
            {order.customer.location && (
              <p><strong>จุดนัดรับ / รายละเอียด:</strong> {order.customer.location}</p>
            )}
            {order.customer.note && (
              <p className="text-amber-800"><strong>หมายเหตุ:</strong> {order.customer.note}</p>
            )}
            <p className="text-[#7A695E] pt-0.5">
              <strong>วิธีชำระ:</strong> {order.paymentMethod === 'promptpay' ? 'โอนผ่านพร้อมเพย์ QR' : 'ชำระสด / สแกน QR ตอนรับของ'}
            </p>
          </div>

          {/* Items breakdown */}
          <div className="space-y-2 pt-2 border-t border-[#F5EFE8]">
            <h4 className="font-bold text-[#2B1810]">รายการที่สั่ง ({order.items.length})</h4>
            <div className="space-y-2 divide-y divide-[#F5EFE8]">
              {order.items.map((item) => (
                <div key={item.cartItemId} className="pt-2 flex justify-between items-start">
                  <div>
                    <p className="font-bold text-xs">{item.name}</p>
                    <p className="text-[10px] text-[#7A695E]">
                      {item.sizeType} · {item.sweetness} x{item.quantity}
                    </p>
                    {item.toppings.length > 0 && (
                      <p className="text-[10px] text-[#9A6237]">
                        +{item.toppings.map((t) => t.name).join(', ')}
                      </p>
                    )}
                  </div>
                  <span className="font-bold font-prompt text-xs">฿{item.totalPrice}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="pt-3 border-t border-[#E5DACF] space-y-1 text-xs">
            <div className="flex justify-between text-[#7A695E]">
              <span>ยอดรวมสินค้า:</span>
              <span className="font-bold text-[#2B1810]">฿{order.subtotal}</span>
            </div>
            <div className="flex justify-between text-[#7A695E]">
              <span>ค่าจัดส่ง:</span>
              <span className={order.deliveryFee === 0 ? 'font-bold text-emerald-600' : 'font-bold text-[#2B1810]'}>
                {order.deliveryFee === 0 ? 'ฟรี' : `฿${order.deliveryFee}`}
              </span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-[#2B1810] pt-2 border-t border-[#E5DACF]">
              <span>ยอดสุทธิทั้งสิ้น:</span>
              <span className="text-lg font-prompt text-[#2B1810]">฿{order.total}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#FAF7F2] border-t border-[#EFE8DE] flex gap-2">
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-xl border border-[#E5DACF] bg-white hover:bg-slate-50 text-[#523E33] text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>พิมพ์</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-[#2B1810] hover:bg-[#3E2317] text-white text-xs font-bold transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>

        {/* Realistic HTML Email Receipt Modal Preview */}
        {showEmailPreview && (
          <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-lg w-full p-5 space-y-3.5 max-h-[88vh] overflow-y-auto shadow-2xl border border-[#EFE8DE]">
              <div className="flex justify-between items-center border-b border-[#F5EFE8] pb-2.5">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#C97A32]" />
                  <h4 className="font-bold text-xs text-[#2B1810]">ตัวอย่างอีเมลใบเสร็จรับเงิน (Gmail HTML)</h4>
                </div>
                <button
                  onClick={() => setShowEmailPreview(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Email Content Box */}
              <div className="bg-[#F8F4EE] rounded-2xl p-4 border border-[#EBE0D2] space-y-3 text-xs">
                <div className="text-[11px] text-[#7A695E] border-b border-[#E5DACF] pb-2 space-y-0.5">
                  <p><strong>ผู้ส่ง:</strong> ร้านน้ำเฉาก๊วย KKU (orders@chaokuay-kku.com)</p>
                  <p><strong>ผู้รับ:</strong> {emailInput}</p>
                  <p><strong>หัวข้อ:</strong> ใบเสร็จรับเงินคำสั่งซื้อ #{order.id} - ร้านน้ำเฉาก๊วย KKU</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-[#E5DACF] space-y-3">
                  <div className="text-center py-1 border-b border-[#F5EFE8]">
                    <span className="text-2xl">🍯</span>
                    <h5 className="font-extrabold text-sm text-[#2B1810]">ร้านน้ำเฉาก๊วย KKU</h5>
                    <p className="text-[10px] text-[#7A695E]">เฉาก๊วยสมุนไพรแท้ มหาวิทยาลัยขอนแก่น</p>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800">
                      ชำระเงินสำเร็จ / E-Receipt
                    </span>
                  </div>

                  <p className="text-[11px] text-[#523E33]">
                    เรียน คุณ <strong>{order.customer.name}</strong>, ขอบคุณสำหรับการสั่งซื้อเครื่องดื่มเฉาก๊วยสมุนไพรแท้ รายละเอียดคำสั่งซื้อของคุณมีดังนี้:
                  </p>

                  <div className="bg-[#FAF7F2] p-2.5 rounded-lg text-[11px] space-y-1">
                    <p><strong>รหัสสั่งซื้อ:</strong> #{order.id}</p>
                    <p><strong>วันเวลา:</strong> {order.createdAt}</p>
                    <p><strong>จัดส่งที่:</strong> {order.customer.location}</p>
                    <p><strong>วิธีชำระ:</strong> {order.paymentMethod === 'promptpay' ? 'โอนผ่านพร้อมเพย์ (PromptPay)' : 'เก็บเงินปลายทาง (COD)'}</p>
                  </div>

                  <div className="space-y-1 text-[11px] border-t border-[#F5EFE8] pt-2">
                    {order.items.map((i) => (
                      <div key={i.cartItemId} className="flex justify-between">
                        <span>{i.name} ({i.sizeType}) x{i.quantity}</span>
                        <span className="font-bold">฿{i.totalPrice}</span>
                      </div>
                    ))}
                    <div className="flex justify-between pt-1 border-t border-dashed border-[#E5DACF] font-bold text-xs text-[#2B1810]">
                      <span>ยอดชำระสุทธิ</span>
                      <span className="text-[#C97A32]">฿{order.total} บาท</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  handleSendEmail();
                  setShowEmailPreview(false);
                }}
                className="w-full py-2.5 rounded-xl bg-[#2B1810] hover:bg-[#3E2317] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                ยืนยันการส่งใบเสร็จไปยัง {emailInput}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
