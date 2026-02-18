'use client';

import { useState } from 'react';
import { PaymentQR } from '@/types';
import { Upload, Save, Trash2, QrCode, CheckCircle, Copy, Check, Wallet } from 'lucide-react';

interface QRCodeManagerProps {
  paymentQR: PaymentQR | null;
  onUpdate: (qr: PaymentQR) => void;
  isAdmin: boolean;
}

export default function QRCodeManager({ paymentQR, onUpdate, isAdmin }: QRCodeManagerProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState(paymentQR?.imageUrl || '');
  const [bankName, setBankName] = useState(paymentQR?.bankName || '');
  const [accountNumber, setAccountNumber] = useState(paymentQR?.accountNumber || '');
  const [accountName, setAccountName] = useState(paymentQR?.accountName || '');

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!imageUrl) {
      alert('Vui lòng tải lên ảnh QR code!');
      return;
    }

    const qr: PaymentQR = {
      imageUrl,
      bankName: bankName.trim() || undefined,
      accountNumber: accountNumber.trim() || undefined,
      accountName: accountName.trim() || undefined,
    };

    onUpdate(qr);
    alert('Đã lưu thông tin thanh toán!');
  };

  const handleClear = () => {
    if (confirm('Bạn có chắc muốn xóa thông tin thanh toán?')) {
      setImageUrl('');
      setBankName('');
      setAccountNumber('');
      setAccountName('');
    }
  };

  // View mode for viewers
  if (!isAdmin) {
    if (!paymentQR || !paymentQR.imageUrl) {
      return (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-4">
            <QrCode className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Chưa có thông tin thanh toán
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Admin chưa thiết lập QR code thanh toán
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-violet-600 rounded-2xl mb-3 sm:mb-4">
            <QrCode className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
            Thông tin thanh toán
          </h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Quét mã QR hoặc chuyển khoản theo thông tin bên dưới
          </p>
        </div>

        {/* QR Code Image */}
        <div className="flex justify-center">
          <div className="relative">
            <img
              src={paymentQR.imageUrl}
              alt="QR Code"
              className="w-64 h-64 sm:w-80 sm:h-80 object-contain border-2 border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg"
            />
          </div>
        </div>

        {/* Bank Information */}
        {(paymentQR.bankName || paymentQR.accountNumber || paymentQR.accountName) && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 sm:p-6 space-y-3 sm:space-y-4">
            <h4 className="font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600" />
              Thông tin chuyển khoản
            </h4>
            
            {paymentQR.bankName && (
              <div className="flex items-center justify-between p-3 sm:p-4 bg-white dark:bg-gray-900 rounded-xl gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">Ngân hàng</p>
                  <p className="font-bold text-gray-900 dark:text-white text-sm sm:text-base break-words">{paymentQR.bankName}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(paymentQR.bankName!, 'bank')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
                >
                  {copied === 'bank' ? (
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  )}
                </button>
              </div>
            )}

            {paymentQR.accountNumber && (
              <div className="flex items-center justify-between p-3 sm:p-4 bg-white dark:bg-gray-900 rounded-xl gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">Số tài khoản</p>
                  <p className="font-bold text-gray-900 dark:text-white font-mono text-sm sm:text-base break-all">{paymentQR.accountNumber}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(paymentQR.accountNumber!, 'account')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
                >
                  {copied === 'account' ? (
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  )}
                </button>
              </div>
            )}

            {paymentQR.accountName && (
              <div className="flex items-center justify-between p-3 sm:p-4 bg-white dark:bg-gray-900 rounded-xl gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">Tên tài khoản</p>
                  <p className="font-bold text-gray-900 dark:text-white text-sm sm:text-base break-words">{paymentQR.accountName}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(paymentQR.accountName!, 'name')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
                >
                  {copied === 'name' ? (
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Admin edit mode
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-violet-600 rounded-2xl mb-3 sm:mb-4">
          <QrCode className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
          Quản lý QR Code thanh toán
        </h3>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Tải lên mã QR thanh toán để người khác có thể chuyển tiền dễ dàng
        </p>
      </div>

      {/* Upload Image */}
      <div>
        <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
          Ảnh QR Code <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="block w-full text-sm text-gray-500 dark:text-gray-400
              file:mr-4 file:py-3 file:px-6
              file:rounded-lg file:border-0
              file:text-sm file:font-bold
              file:bg-violet-600 file:text-white
              hover:file:bg-violet-700
              file:transition-colors
              cursor-pointer border-2 border-gray-200 dark:border-gray-700 rounded-lg"
          />
        </div>
        {imageUrl && (
          <div className="mt-4 sm:mt-6 flex justify-center">
            <img
              src={imageUrl}
              alt="QR Code"
              className="w-64 h-64 sm:w-80 sm:h-80 object-contain border-2 border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg"
            />
          </div>
        )}
      </div>

      {/* Bank Details */}
      <div className="space-y-3 sm:space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
            Tên ngân hàng (tùy chọn)
          </label>
          <input
            type="text"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            placeholder="VD: VietcomBank, Techcombank..."
            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-900 dark:text-white transition-all placeholder:text-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
            Số tài khoản (tùy chọn)
          </label>
          <input
            type="text"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder="0123456789"
            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-900 dark:text-white transition-all placeholder:text-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
            Tên tài khoản (tùy chọn)
          </label>
          <input
            type="text"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            placeholder="NGUYEN VAN A"
            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-900 dark:text-white transition-all placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-bold transition-colors"
        >
          <Save className="w-5 h-5" />
          Lưu thông tin
        </button>
        {paymentQR && (
          <button
            onClick={handleClear}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            Xóa
          </button>
        )}
      </div>

      {/* Success Message */}
      {paymentQR && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            <p className="text-green-800 dark:text-green-300 font-medium">
              Thông tin thanh toán đã được lưu thành công!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
