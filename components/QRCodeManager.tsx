'use client';

import { useState } from 'react';
import { PaymentQR } from '@/types';
import { Upload, Save, Trash2, QrCode, CheckCircle } from 'lucide-react';

interface QRCodeManagerProps {
  paymentQR: PaymentQR | null;
  onUpdate: (qr: PaymentQR) => void;
}

export default function QRCodeManager({ paymentQR, onUpdate }: QRCodeManagerProps) {
  const [imageUrl, setImageUrl] = useState(paymentQR?.imageUrl || '');
  const [bankName, setBankName] = useState(paymentQR?.bankName || '');
  const [accountNumber, setAccountNumber] = useState(paymentQR?.accountNumber || '');
  const [accountName, setAccountName] = useState(paymentQR?.accountName || '');

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
      // Clear from Firebase will be handled by onUpdate callback
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl mb-4 shadow-lg">
          <QrCode className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Quản lý QR Code thanh toán
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Lưu mã QR thanh toán của bạn để người khác có thể chuyển tiền dễ dàng
        </p>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          <Upload className="w-4 h-4 text-violet-600" />
          Ảnh QR Code <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="block w-full text-sm text-gray-500 dark:text-gray-400
              file:mr-4 file:py-3 file:px-6
              file:rounded-xl file:border-0
              file:text-sm file:font-bold
              file:bg-gradient-to-r file:from-violet-600 file:to-fuchsia-600 file:text-white
              hover:file:from-violet-700 hover:file:to-fuchsia-700
              file:shadow-lg file:shadow-violet-500/30
              hover:file:shadow-xl
              file:transition-all file:duration-300
              cursor-pointer"
          />
        </div>
        {imageUrl && (
          <div className="mt-6 flex justify-center">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <img
                src={imageUrl}
                alt="QR Code"
                className="relative w-72 h-72 object-contain border-4 border-white dark:border-gray-700 rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Tên ngân hàng (tùy chọn)
          </label>
          <input
            type="text"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            placeholder="VD: VietcomBank, Techcombank..."
            className="w-full px-5 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 dark:bg-gray-900 dark:text-white transition-all duration-300 placeholder:text-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Số tài khoản (tùy chọn)
          </label>
          <input
            type="text"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder="0123456789"
            className="w-full px-5 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 dark:bg-gray-900 dark:text-white transition-all duration-300 placeholder:text-gray-400"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Tên tài khoản (tùy chọn)
        </label>
        <input
          type="text"
          value={accountName}
          onChange={(e) => setAccountName(e.target.value)}
          placeholder="NGUYEN VAN A"
          className="w-full px-5 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 dark:bg-gray-900 dark:text-white transition-all duration-300 placeholder:text-gray-400"
        />
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleSave}
          className="group flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl hover:from-violet-700 hover:to-fuchsia-700 transition-all duration-300 font-bold shadow-xl shadow-violet-500/50 hover:shadow-2xl hover:scale-[1.02]"
        >
          <Save className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          Lưu thông tin
        </button>
        {paymentQR && (
          <button
            onClick={handleClear}
            className="group flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 transition-all duration-300 font-bold shadow-xl shadow-red-500/30 hover:shadow-2xl hover:scale-[1.02]"
          >
            <Trash2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            Xóa
          </button>
        )}
      </div>

      {paymentQR && (
        <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border-2 border-green-300 dark:border-green-700">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            <p className="text-green-800 dark:text-green-300 font-bold text-lg">
              Thông tin thanh toán đã được lưu và sẽ hiển thị trong danh sách hoạt động!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
