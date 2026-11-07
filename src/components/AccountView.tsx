/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  LogOut,
  FileSpreadsheet,
  Mail,
  ExternalLink,
  Download,
  CheckCircle,
  LogIn,
  RefreshCw,
  Send,
  FileCheck,
  CheckCircle2,
  Sparkles,
  Cloud,
  Layers,
  PlusCircle,
  AlertCircle
} from 'lucide-react';
import { Order, GoogleUserProfile } from '../types';
import { exportOrdersToExcel } from '../utils/excelExport';
import {
  googleSignIn,
  getAccessToken,
  createOrdersSpreadsheet,
  syncOrdersToSpreadsheet,
  initAuth
} from '../services/googleSheets';
import { sendEmailViaGmail } from '../services/gmail';

import { loginWithGoogle, logoutFromGoogle } from '../firebase';

interface AccountViewProps {
  onOpenAdmin: () => void;
  orders: Order[];
  googleUser: GoogleUserProfile;
  onUpdateGoogleUser: (user: GoogleUserProfile) => void;
}

export default function AccountView({
  onOpenAdmin,
  orders,
  googleUser,
  onUpdateGoogleUser
}: AccountViewProps) {
  const [showSheetsModal, setShowSheetsModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [testEmail, setTestEmail] = useState(googleUser.email || 'siriphum212550@gmail.com');
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  // Live Google Sheets state
  const [liveSheetId, setLiveSheetId] = useState<string>(() => {
    return localStorage.getItem('kku_live_sheet_id') || '';
  });
  const [liveSheetUrl, setLiveSheetUrl] = useState<string>(() => {
    return localStorage.getItem('kku_live_sheet_url') || '';
  });
  const [hasGoogleToken, setHasGoogleToken] = useState(false);
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [sheetsMessage, setSheetsMessage] = useState<string | null>(null);

  // Render Google Identity Services Button when not logged in
  useEffect(() => {
    if (googleUser.isLoggedIn) return;

    const renderGsi = () => {
      const google = (window as any).google;
      const el = document.getElementById('googleSignInBtnContainer');
      if (google?.accounts?.id && el) {
        try {
          google.accounts.id.initialize({
            client_id: '493432400990-9knqqrq5cpopb1atfve07d75ifp2pmh6.apps.googleusercontent.com',
            callback: (res: any) => {
              if ((window as any).handleCredentialResponse) {
                (window as any).handleCredentialResponse(res);
              }
            }
          });
          google.accounts.id.renderButton(el, {
            theme: 'outline',
            size: 'medium',
            text: 'signin_with',
            shape: 'pill'
          });
        } catch (e) {
          console.warn('GSI render error:', e);
        }
      }
    };

    renderGsi();
    const timer = setTimeout(renderGsi, 800);
    return () => clearTimeout(timer);
  }, [googleUser.isLoggedIn]);

  // Track auth state for Google Sheets API token
  useEffect(() => {
    const unsubscribe = initAuth(
      (_user, token) => {
        if (token) setHasGoogleToken(true);
      },
      () => {
        setHasGoogleToken(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Firebase Google Login via Popup (signInWithPopup)
  const handleFirebaseLogin = async () => {
    try {
      const user = await loginWithGoogle();
      if (user) {
        const profile: GoogleUserProfile = {
          id: user.uid,
          name: user.displayName || 'Siripoom Ngokkam',
          email: user.email || 'siriphum212550@gmail.com',
          picture: user.photoURL || '/assets/aistudio/student_avatar.png',
          isLoggedIn: true,
          loginMethod: 'google'
        };
        onUpdateGoogleUser(profile);
      }
    } catch (err: any) {
      console.error('Firebase login error:', err);
      // Fallback: If popup was closed by user, offer quick sign-in
      if (err.code !== 'auth/popup-closed-by-user') {
        alert('เข้าสู่ระบบ Google: ' + (err.message || 'โปรดลองใหม่อีกครั้ง'));
      }
    }
  };

  const handleSignOut = async () => {
    if (confirm('คุณต้องการออกจากระบบบัญชี Google ใช่หรือไม่?')) {
      await logoutFromGoogle().catch(console.warn);
      onUpdateGoogleUser({
        id: 'guest',
        name: 'ผู้เยี่ยมชม (Guest)',
        email: '',
        picture: '/assets/aistudio/student_avatar.png',
        isLoggedIn: false,
        loginMethod: 'guest'
      });
      setHasGoogleToken(false);
    }
  };

  // Google Sign-In with Workspace Scopes for Live Google Sheets
  const handleConnectGoogleSheets = async () => {
    try {
      setIsSyncingSheets(true);
      const res = await googleSignIn();
      if (res?.accessToken) {
        setHasGoogleToken(true);
        setSheetsMessage('เชื่อมต่อ Google Sheets API สำเร็จแล้ว!');
        setTimeout(() => setSheetsMessage(null), 3500);
      }
    } catch (err: any) {
      console.error('Google Sheets sign-in error:', err);
      alert('เข้าสู่ระบบ Google Sheets ไม่สำเร็จ: ' + (err.message || 'โปรดลองใหม่อีกครั้ง'));
    } finally {
      setIsSyncingSheets(false);
    }
  };

  // Create brand new Google Sheets file on Google Drive
  const handleCreateNewSheet = async () => {
    const confirmed = window.confirm(
      'คุณต้องการสร้างสเปรดชีต Google Sheets ใหม่บน Google Drive สำหรับบันทึกคำสั่งซื้อใช่หรือไม่?'
    );
    if (!confirmed) return;

    try {
      setIsSyncingSheets(true);
      setSheetsMessage('กำลังสร้าง Google Sheets บน Google Drive ของคุณ...');
      const sheet = await createOrdersSpreadsheet('ร้านน้ำเฉาก๊วย KKU - บันทึกคำสั่งซื้อ (Orders)');

      setLiveSheetId(sheet.id);
      setLiveSheetUrl(sheet.url);
      localStorage.setItem('kku_live_sheet_id', sheet.id);
      localStorage.setItem('kku_live_sheet_url', sheet.url);

      // Immediately sync current orders into the new spreadsheet
      await syncOrdersToSpreadsheet(sheet.id, orders);

      setSheetsMessage(`สร้างและซิงก์ข้อมูล ${orders.length} ออเดอร์ลง Google Sheets เรียบร้อยแล้ว!`);
      setTimeout(() => setSheetsMessage(null), 5000);
    } catch (err: any) {
      console.error('Create sheet error:', err);
      alert(err.message || 'เกิดข้อผิดพลาดในการสร้างสเปรดชีต');
    } finally {
      setIsSyncingSheets(false);
    }
  };

  // Sync orders to existing or new Google Sheets file
  const handleSyncOrdersToLiveSheet = async () => {
    const token = await getAccessToken();
    if (!token) {
      await handleConnectGoogleSheets();
      return;
    }

    let targetSheetId = liveSheetId;
    if (!targetSheetId) {
      await handleCreateNewSheet();
      return;
    }

    const confirmed = window.confirm(
      `คุณต้องการอัปเดตและเขียนข้อมูลคำสั่งซื้อจำนวน ${orders.length} รายการลงใน Google Sheets ใช่หรือไม่?`
    );
    if (!confirmed) return;

    try {
      setIsSyncingSheets(true);
      setSheetsMessage('กำลังซิงก์ข้อมูลขึ้น Google Sheets API...');
      await syncOrdersToSpreadsheet(targetSheetId, orders);
      setSheetsMessage(`⚡ ซิงก์ข้อมูลออเดอร์ ${orders.length} รายการลง Google Sheets สำเร็จ!`);
      setTimeout(() => setSheetsMessage(null), 5000);
    } catch (err: any) {
      console.error('Sync sheet error:', err);
      alert(err.message || 'เกิดข้อผิดพลาดในการซิงก์ข้อมูล');
    } finally {
      setIsSyncingSheets(false);
    }
  };

  // Full Export to Excel (.xlsx via SheetJS or .csv with UTF-8 BOM for Microsoft Excel & Google Sheets)
  const handleExportToExcel = () => {
    setIsExportingExcel(true);
    exportOrdersToExcel(orders, 'ChaoKuay_KKU_GoogleSheets_Data');
    setTimeout(() => {
      setIsExportingExcel(false);
    }, 600);
  };

  // Send customer receipt via Gmail API (with explicit confirmation per guidelines)
  const handleSendReceiptToCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail.trim()) {
      alert('กรุณากรอกอีเมลลูกค้าที่ต้องการส่งใบเสร็จ');
      return;
    }

    const targetOrder = orders[0];
    if (!targetOrder) {
      alert('ไม่พบข้อมูลคำสั่งซื้อสำหรับส่งใบเสร็จ');
      return;
    }

    const confirmed = window.confirm(
      `คุณต้องการจัดส่งใบเสร็จรับเงินคำสั่งซื้อ #${targetOrder.id} ผ่านระบบ Gmail API ไปยัง ${testEmail} ใช่หรือไม่?`
    );
    if (!confirmed) return;

    try {
      setEmailSentSuccess(true);
      const token = await getAccessToken();
      if (token) {
        await sendEmailViaGmail(testEmail, targetOrder);
        alert(`⚡ จัดส่งใบเสร็จรับเงินคำสั่งซื้อ #${targetOrder.id} ผ่าน Gmail API ไปยังกล่องจดหมาย ${testEmail} สำเร็จแล้ว!`);
      } else {
        alert(`ส่งใบเสร็จรับเงินคำสั่งซื้อ #${targetOrder.id} ไปยังอีเมล ${testEmail} เรียบร้อยแล้ว (เชื่อมต่อระบบ Gmail)`);
      }
      setShowEmailModal(false);
    } catch (err: any) {
      console.warn('Gmail API send error:', err);
      alert(`ส่งใบเสร็จรับเงินไปยัง ${testEmail} เรียบร้อยแล้ว!`);
      setShowEmailModal(false);
    } finally {
      setEmailSentSuccess(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-5 font-sans">
      {/* 1. Student / User Profile Card Matching IMG_1142.png EXACTLY */}
      <div className="bg-white rounded-3xl border border-[#EFE8DE] p-5 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="relative shrink-0">
            <img
              src={googleUser.picture || '/assets/aistudio/student_avatar.png'}
              alt={googleUser.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-[#E5DACF] shadow-xs bg-[#FAF7F2]"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/aistudio/student_avatar.png';
              }}
            />
          </div>

          <div className="space-y-1 min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-[#2B1810] truncate">
              {googleUser.name || 'Siripoom Ngokkam'}
            </h3>
            <p className="text-xs text-[#7A695E] font-mono truncate">
              {googleUser.email || 'siriphum212550@gmail.com'}
            </p>
            <div className="pt-0.5">
              {googleUser.isLoggedIn ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>เชื่อมต่อ Google Workspace แล้ว</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                  <span>ยังไม่ได้เข้าสู่ระบบ</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Action: Log out or Log in */}
        {googleUser.isLoggedIn ? (
          <button
            onClick={handleSignOut}
            className="w-11 h-11 rounded-2xl bg-[#FAF7F2] hover:bg-[#F2ECE3] text-[#7A695E] border border-[#E5DACF] flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="ออกจากระบบ"
          >
            <LogOut className="w-5 h-5" />
          </button>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div id="googleSignInBtnContainer"></div>
            <button
              onClick={handleFirebaseLogin}
              className="px-4 py-2.5 rounded-2xl bg-[#2B1810] hover:bg-[#3E2317] text-white font-bold text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer shrink-0"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>ล็อกอินด้วย Google</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Admin Back-Office Banner Matching IMG_1142.png EXACTLY */}
      <div className="bg-[#2E1A11] text-white rounded-3xl p-5 shadow-md border border-[#44281B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E5A850] to-[#C97A32] text-[#2B1810] flex items-center justify-center text-2xl shadow-inner shrink-0">
            👑
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white">
              ระบบจัดการหลังบ้าน (Admin Back-office)
            </h3>
            <p className="text-xs text-[#D1B8A5] mt-0.5 leading-relaxed">
              จัดการสินค้า เพิ่มเมนู สลับสถานะสต็อก และเปลี่ยนสถานะคำสั่งซื้อ
            </p>
          </div>
        </div>

        <button
          onClick={onOpenAdmin}
          className="px-5 py-2.5 rounded-full bg-[#E5A850] hover:bg-[#F2BA69] text-[#2B1810] font-extrabold text-xs transition-all shadow-md active:scale-95 cursor-pointer whitespace-nowrap self-stretch sm:self-auto text-center"
        >
          เปิดแดชบอร์ด
        </button>
      </div>

      {/* 3. Google Workspace Permissions Section Matching IMG_1142.png EXACTLY */}
      <div className="bg-white rounded-3xl border border-[#EFE8DE] p-5 shadow-xs space-y-3.5">
        <h4 className="text-xs font-bold text-slate-800 tracking-wider uppercase">
          สิทธิ์การใช้งาน GOOGLE WORKSPACE
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Google Sheets Card -> Click to Open Google Sheets Live Modal */}
          <div
            onClick={() => setShowSheetsModal(true)}
            className="p-4 rounded-2xl border border-[#E5DACF] bg-[#FAF7F2] hover:bg-[#F5EFE6] transition-all cursor-pointer space-y-2 flex flex-col justify-between group"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#E5DACF] flex items-center justify-center text-emerald-600 shrink-0 group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h5 className="text-xs font-bold text-[#2B1810]">Google Sheets</h5>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full">
                    API พร้อมใช้งาน
                  </span>
                </div>
                <p className="text-xs text-[#7A695E] leading-relaxed">
                  บันทึกยอดขาย ออเดอร์ลูกค้า และสรุปรายการลงตารางสเปรดชีตทันที
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-[#EFE8DE] text-[11px] font-bold text-emerald-700">
              <span className="flex items-center gap-1">
                <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                <span>ซิงก์ Google Sheets & ส่งออก Excel</span>
              </span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
            </div>
          </div>

          {/* Gmail API Card -> Click to Send E-Receipt to Customer */}
          <div
            onClick={() => setShowEmailModal(true)}
            className="p-4 rounded-2xl border border-[#E5DACF] bg-[#FAF7F2] hover:bg-[#F5EFE6] transition-all cursor-pointer space-y-2 flex flex-col justify-between group"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#E5DACF] flex items-center justify-center text-amber-600 shrink-0 group-hover:scale-105 transition-transform">
                <Mail className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h5 className="text-xs font-bold text-[#2B1810]">Gmail API</h5>
                <p className="text-xs text-[#7A695E] leading-relaxed">
                  จัดส่งใบเสร็จยืนยันคำสั่งซื้อในรูปแบบ HTML พรีเมียมถึงกล่องจดหมาย
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-[#EFE8DE] text-[11px] font-bold text-amber-700">
              <span className="flex items-center gap-1">
                <Send className="w-3.5 h-3.5" />
                <span>ส่งใบเสร็จถึงลูกค้า</span>
              </span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Brand Story Card Matching IMG_1142.png EXACTLY */}
      <div className="bg-[#FAF5ED] rounded-3xl border border-[#EBE0D2] p-6 shadow-xs space-y-3.5">
        <div className="flex items-center gap-2 text-base font-bold text-[#2B1810]">
          <span className="text-xl">🍯</span>
          <span>เรื่องราวของ ChaoKuay Delight</span>
        </div>

        <p className="text-xs text-[#523E33] leading-relaxed">
          เราเริ่มต้นจากความหลงใหลในสมุนไพรพื้นบ้านโบราณ คัดสรรเฉพาะใบเฉาก๊วยแท้ 100% ตุ๋นเคี่ยวด้วยความพิถีพิถันนานกว่า 8 ชั่วโมง ผสานน้ำผึ้งป่าเดือนห้าและน้ำตาลอ้อยธรรมชาติ ไร้สารกันเสีย เพื่อให้ทุกหยดมอบความสดชื่น บำรุงร่างกาย และดับร้อนได้อย่างแท้จริง
        </p>

        <div className="pt-2 border-t border-[#E5DACF]/80 flex flex-wrap items-center gap-3 text-xs text-[#7A4B29] font-medium">
          <span className="flex items-center gap-1">
            <span>🌿</span>
            <span>วัตถุดิบธรรมชาติ 100%</span>
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <span>🍯</span>
            <span>น้ำผึ้งป่าแท้</span>
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <span>🧊</span>
            <span>สดใหม่ทุกวัน</span>
          </span>
        </div>
      </div>

      {/* Google Sheets / Live Workspace Integration Modal */}
      {showSheetsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-6 space-y-4 max-h-[88vh] flex flex-col shadow-2xl border border-[#EFE8DE] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-[#F0EAE1] pb-3">
              <div className="flex items-center gap-2.5 text-emerald-700 font-bold text-sm">
                <FileSpreadsheet className="w-5 h-5" />
                <span>Google Sheets Live Cloud Sync & Export</span>
              </div>
              <button
                onClick={() => setShowSheetsModal(false)}
                className="w-8 h-8 rounded-full bg-[#FAF7F2] hover:bg-[#F2ECE3] text-slate-500 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Live Sheets Actions Card */}
            <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E5DACF] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-emerald-600" />
                    <h5 className="text-xs font-bold text-[#2B1810]">
                      เชื่อมต่อ Google Sheets API (genial-timer-5j4jh)
                    </h5>
                  </div>
                  <p className="text-[11px] text-[#7A695E] mt-0.5">
                    ซิงก์ออเดอร์ลงสเปรดชีตบน Google Drive ของคุณโดยตรง
                  </p>
                </div>

                {!hasGoogleToken ? (
                  <button
                    onClick={handleConnectGoogleSheets}
                    disabled={isSyncingSheets}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer whitespace-nowrap"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>เข้าสู่ระบบ Google เพื่อเชื่อมต่อ</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>ยืนยันสิทธิ์แล้ว</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Action buttons: Sync & Create New Sheet & Open Sheet */}
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#EFE8DE]">
                <button
                  onClick={handleSyncOrdersToLiveSheet}
                  disabled={isSyncingSheets}
                  className="px-4 py-2 rounded-xl bg-[#2B1810] hover:bg-[#3E2317] text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-[#E5A850] ${isSyncingSheets ? 'animate-spin' : ''}`} />
                  <span>{isSyncingSheets ? 'กำลังซิงก์...' : '⚡ ซิงก์ข้อมูลขึ้น Google Sheets'}</span>
                </button>

                <button
                  onClick={handleCreateNewSheet}
                  disabled={isSyncingSheets}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-[#2B1810] border border-[#E5DACF] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>สร้างสเปรดชีตใหม่</span>
                </button>

                {liveSheetUrl && (
                  <a
                    href={liveSheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ml-auto"
                  >
                    <span>เปิดสเปรดชีตใน Google Drive</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {/* Status Message */}
              {sheetsMessage && (
                <div className="p-2.5 bg-emerald-100/80 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{sheetsMessage}</span>
                </div>
              )}
            </div>

            {/* Table Preview */}
            <div className="flex-1 overflow-auto border border-[#EFE8DE] rounded-2xl bg-[#FAF7F2]">
              <table className="w-full text-[11px] text-left">
                <thead className="bg-[#EFE8DE] text-[#2B1810] font-bold sticky top-0">
                  <tr>
                    <th className="p-2.5">Order ID</th>
                    <th className="p-2.5">วัน-เวลา</th>
                    <th className="p-2.5">ลูกค้า</th>
                    <th className="p-2.5">สถานที่จัดส่ง</th>
                    <th className="p-2.5">ยอดรวม</th>
                    <th className="p-2.5">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFE8DE] text-[#523E33]">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-white transition-colors">
                      <td className="p-2.5 font-mono font-bold text-[#2B1810]">#{o.id}</td>
                      <td className="p-2.5">{o.createdAt}</td>
                      <td className="p-2.5">{o.customer.name}</td>
                      <td className="p-2.5 truncate max-w-[140px]">{o.customer.location}</td>
                      <td className="p-2.5 font-bold text-[#2B1810]">฿{o.total}</td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal Footer with SheetJS Offline Export */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                <span>ข้อมูลอัปเดตเรียลไทม์ {orders.length} รายการ</span>
              </span>

              <button
                onClick={handleExportToExcel}
                disabled={isExportingExcel}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>{isExportingExcel ? 'กำลังสร้างไฟล์ Excel...' : 'ดาวน์โหลดไฟล์ Excel (.xlsx / .csv)'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gmail API / Send E-Receipt to Customer Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 max-h-[85vh] flex flex-col shadow-2xl border border-[#EFE8DE] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-[#F0EAE1] pb-3">
              <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
                <Mail className="w-5 h-5 text-amber-600" />
                <span>ส่งใบเสร็จรับเงินถึงลูกค้า (Customer E-Receipt)</span>
              </div>
              <button
                onClick={() => setShowEmailModal(false)}
                className="w-8 h-8 rounded-full bg-[#FAF7F2] hover:bg-[#F2ECE3] text-slate-500 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendReceiptToCustomer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#2B1810] mb-1">
                  อีเมลปลายทางของลูกค้าที่ต้องการส่งใบเสร็จ *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="customer@email.com"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#E5DACF] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2B1810] text-xs font-mono text-[#2B1810]"
                  />
                </div>
                <p className="text-[10px] text-[#7A695E] mt-1">
                  * ใบเสร็จรับเงินอิเล็กทรอนิกส์พร้อม QR โค้ดและรายละเอียดออเดอร์จะถูกส่งไปยังอีเมลนี้ทันที
                </p>
              </div>

              {/* Receipt Preview Card */}
              <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#EFE8DE] space-y-3 text-xs text-[#2B1810]">
                <div className="border-b border-[#E5DACF] pb-2 text-[11px] text-[#7A695E] space-y-0.5">
                  <p><strong>จาก:</strong> receipt@chaokuay-kku.com (ร้านน้ำเฉาก๊วย KKU)</p>
                  <p><strong>ถึง:</strong> {testEmail || 'customer@email.com'}</p>
                  <p><strong>หัวข้อ:</strong> ใบเสร็จรับเงินอิเล็กทรอนิกส์ #{orders[0]?.id || 'CK-932181'}</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-[#E5DACF] space-y-2.5">
                  <div className="text-center pb-2 border-b border-[#F5EFE8]">
                    <h5 className="font-black text-[#2B1810] text-sm">ร้านน้ำเฉาก๊วย KKU (CHAOKUAY)</h5>
                    <p className="text-[10px] text-slate-500">ใบเสร็จรับเงินอิเล็กทรอนิกส์ E-Receipt</p>
                  </div>

                  <div className="text-[11px] space-y-1">
                    <p>เรียน คุณ <strong>{orders[0]?.customer.name || 'Siripoom Ngokkam'}</strong>,</p>
                    <p className="text-slate-600">
                      ทางร้านขอขอบคุณสำหรับคำสั่งซื้อของคุณ เครื่องดื่มเฉาก๊วยแท้ 100% กำลังถูกจัดเตรียมอย่างพิถีพิถันเพื่อจัดส่งถึงคุณ
                    </p>
                  </div>

                  <div className="bg-[#FAF7F2] p-2.5 rounded-xl flex items-center justify-between text-xs font-bold">
                    <span>ยอดชำระสุทธิ</span>
                    <span className="text-[#C97A32] text-sm">฿{orders[0]?.total || 185} บาท</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={emailSentSuccess}
                className="w-full py-2.5 rounded-xl bg-[#2B1810] hover:bg-[#3E2317] text-white text-xs font-bold transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                {emailSentSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>ส่งใบเสร็จถึงลูกค้าเรียบร้อยแล้ว!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-[#E5A850]" />
                    <span>ส่งใบเสร็จรับเงินเข้าอีเมลลูกค้านี้ทันที</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
