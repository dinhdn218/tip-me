'use client';

import { useState } from 'react';
import { PaymentQR } from '@/types';
import { Upload, Save, Trash2, QrCode, CheckCircle, Copy, Check, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

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
    onUpdate({
      imageUrl,
      bankName: bankName.trim() || undefined,
      accountNumber: accountNumber.trim() || undefined,
      accountName: accountName.trim() || undefined,
    });
  };

  const handleClear = () => {
    if (confirm('Bạn có chắc muốn xóa thông tin thanh toán?')) {
      setImageUrl('');
      setBankName('');
      setAccountNumber('');
      setAccountName('');
    }
  };

  // View mode
  if (!isAdmin) {
    if (!paymentQR?.imageUrl) {
      return (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-2xl mb-4">
            <QrCode className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-foreground font-semibold">Chưa có thông tin thanh toán</p>
          <p className="text-muted-foreground text-sm mt-1">Admin chưa thiết lập QR code thanh toán</p>
        </div>
      );
    }

    return (
      <div className="space-y-5 max-w-sm mx-auto">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-xl mb-3">
            <QrCode className="w-6 h-6 text-primary-foreground" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Thông tin thanh toán</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Quét mã QR hoặc chuyển khoản theo thông tin bên dưới</p>
        </div>

        <div className="flex justify-center">
          <img
            src={paymentQR.imageUrl}
            alt="QR Code thanh toán"
            className="w-64 h-64 object-contain border border-border rounded-xl shadow-sm"
          />
        </div>

        {(paymentQR.bankName || paymentQR.accountNumber || paymentQR.accountName) && (
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <Wallet className="w-4 h-4 text-primary" />
                Thông tin chuyển khoản
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              {[
                { key: 'bank', label: 'Ngân hàng', value: paymentQR.bankName },
                { key: 'account', label: 'Số tài khoản', value: paymentQR.accountNumber, mono: true },
                { key: 'name', label: 'Tên tài khoản', value: paymentQR.accountName },
              ].filter(f => f.value).map(({ key, label, value, mono }) => (
                <div key={key} className="flex items-center justify-between p-2.5 bg-muted/50 rounded-lg gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className={`font-semibold text-sm text-foreground break-all ${mono ? 'font-mono' : ''}`}>{value}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => copyToClipboard(value!, key)}
                  >
                    {copied === key ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Admin edit mode
  return (
    <div className="space-y-5 max-w-lg mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shrink-0">
          <QrCode className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-bold text-foreground">Quản lý QR Code thanh toán</h3>
          <p className="text-xs text-muted-foreground">Tải lên mã QR để người dùng có thể chuyển tiền</p>
        </div>
      </div>

      <Separator />

      {/* Upload Image */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">
          Ảnh QR Code <span className="text-destructive">*</span>
        </Label>
        <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
          <label className="cursor-pointer block">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="sr-only"
            />
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">Nhấn để tải lên ảnh QR</p>
            <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP tối đa 5MB</p>
          </label>
        </div>
        {imageUrl && (
          <div className="flex justify-center mt-3">
            <img
              src={imageUrl}
              alt="QR Code preview"
              className="w-56 h-56 object-contain border border-border rounded-xl shadow-sm"
            />
          </div>
        )}
      </div>

      {/* Bank Details */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Thông tin ngân hàng (tùy chọn)</p>
        <div className="space-y-2">
          <Label htmlFor="bankName">Tên ngân hàng</Label>
          <Input
            id="bankName"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            placeholder="VD: VietcomBank, Techcombank..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="accountNumber">Số tài khoản</Label>
          <Input
            id="accountNumber"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder="0123456789"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="accountName">Tên tài khoản</Label>
          <Input
            id="accountName"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            placeholder="NGUYEN VAN A"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button onClick={handleSave} className="flex-1 gap-2">
          <Save className="w-4 h-4" />
          Lưu thông tin
        </Button>
        {paymentQR && (
          <Button variant="destructive" onClick={handleClear} className="gap-2">
            <Trash2 className="w-4 h-4" />
            Xóa
          </Button>
        )}
      </div>

      {paymentQR && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
            Thông tin thanh toán đã được lưu thành công!
          </p>
        </div>
      )}
    </div>
  );
}
