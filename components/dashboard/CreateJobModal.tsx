'use client';

import { useState } from 'react';
import { CreateJobRequest } from '@/lib/types';
import { cn } from '@/lib/utils';
import { X, Loader2, CheckCircle2, MapPin, Phone, FileText, Tag, DollarSign } from 'lucide-react';

interface CreateJobModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const CATEGORIES = [
  'ไฟฟ้า', 'ประปา', 'แอร์/ระบบปรับอากาศ', 'งานไม้', 'ทาสี',
  'จัดสวน/ดูแลสวน', 'ทำความสะอาด', 'ซ่อมเครื่องใช้ไฟฟ้า', 'เน็ตเวิร์ค/ไอที', 'อื่นๆ',
];

const initialForm: CreateJobRequest = {
  title: '',
  description: '',
  category: '',
  customer_phone: '',
  location_name: '',
  google_maps_url: '',
  budget: undefined,
};

export function CreateJobModal({ open, onClose, onCreated }: CreateJobModalProps) {
  const [form, setForm] = useState<CreateJobRequest>(initialForm);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showValidation, setShowValidation] = useState(false);

  if (!open) return null;

  function setField(field: keyof CreateJobRequest, value: string | number | undefined) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleNumericInput(field: 'customer_phone' | 'budget', value: string) {
    const cleaned = value.replace(/\D/g, '');
    if (field === 'budget') {
      setField(field, cleaned ? parseInt(cleaned, 10) : undefined);
    } else {
      setField(field, cleaned);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setShowValidation(true);
    setError('');

    if (!form.title || !form.category) {
      setError('กรุณากรอกข้อมูลในช่องที่จำเป็นให้ครบถ้วน (ที่มีเครื่องหมาย *)');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? 'เกิดข้อผิดพลาดในการสร้างงาน');
      }

      setSuccess(true);
      onCreated();
      setTimeout(() => {
        setSuccess(false);
        setShowValidation(false);
        setForm(initialForm);
        onClose();
      }, 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ');
    } finally {
      setLoading(false);
    }
  }

  const isInvalid = (field: keyof CreateJobRequest) => {
    if (!showValidation) return false;
    if (field === 'title') return !form.title;
    if (field === 'category') return !form.category;
    return false;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">สร้างงานใหม่</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              การโพสต์จะแจ้งเตือนช่างเทคนิคกว่า 200 คนผ่าน LINE ทันที
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {success && (
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4 animate-in fade-in zoom-in duration-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="text-emerald-800 font-semibold text-sm">สร้างงานสำเร็จ!</p>
                <p className="text-emerald-600 text-xs">ส่งการแจ้งเตือนผ่าน LINE ไปยังช่างเทคนิคทั้งหมดแล้ว</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 text-sm text-red-700 font-medium">
              ⚠️ {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">
              <FileText className="inline w-3.5 h-3.5 mr-1.5 text-gray-400" />
              หัวข้องาน <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              placeholder="เช่น ซ่อมแอร์น้ำหยด, เปลี่ยนก๊อกน้ำอ่างล้างหน้า"
              className={cn(
                "w-full rounded-xl px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2",
                isInvalid('title')
                  ? "border-2 border-red-300 ring-red-100 placeholder-red-300"
                  : "border border-gray-200 focus:ring-blue-500 focus:border-transparent"
              )}
            />
            {isInvalid('title') && (
              <p className="text-[11px] text-red-500 font-medium ml-1">กรุณาระบุหัวข้องาน</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">
              <Tag className="inline w-3.5 h-3.5 mr-1.5 text-gray-400" />
              หมวดหมู่งาน <span className="text-red-500">*</span>
            </label>
            <select
              value={form.category}
              onChange={(e) => setField('category', e.target.value)}
              className={cn(
                "w-full rounded-xl px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 bg-white appearance-none",
                isInvalid('category')
                  ? "border-2 border-red-300 ring-red-100 text-red-400"
                  : "border border-gray-200 focus:ring-blue-500 focus:border-transparent"
              )}
            >
              <option value="">เลือกหมวดหมู่…</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {isInvalid('category') && (
              <p className="text-[11px] text-red-500 font-medium ml-1">กรุณาเลือกหมวดหมู่</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">
              รายละเอียดเพิ่มเติม
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              placeholder="อธิบายอาการเสียและรายละเอียดที่ช่างควรรู้…"
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">
              <MapPin className="inline w-3.5 h-3.5 mr-1.5 text-gray-400" />
              ชื่อสถานที่ / อาคาร
            </label>
            <input
              type="text"
              value={form.location_name}
              onChange={(e) => setField('location_name', e.target.value)}
              placeholder="เช่น คอนโดสุขุมวิท 11, หมู่บ้านปัฐวิกรณ์"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">
              ลิงก์ Google Maps
            </label>
            <input
              type="url"
              value={form.google_maps_url}
              onChange={(e) => setField('google_maps_url', e.target.value)}
              placeholder="https://maps.google.com/..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">
                <Phone className="inline w-3.5 h-3.5 mr-1.5 text-gray-400" />
                เบอร์โทรลูกค้า
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={form.customer_phone}
                onChange={(e) => handleNumericInput('customer_phone', e.target.value)}
                placeholder="0XXXXXXXXX"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">
                <DollarSign className="inline w-3.5 h-3.5 mr-1.5 text-gray-400" />
                งบประมาณ (บาท)
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={form.budget ?? ''}
                onChange={(e) => handleNumericInput('budget', e.target.value)}
                placeholder="0"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3.5 flex items-start gap-3">
            <span className="text-xl leading-none mt-0.5">📱</span>
            <p className="text-[11px] text-blue-700 leading-relaxed font-medium">
              <strong>การแจ้งเตือนทาง LINE:</strong> ทันทีที่กดสร้างงาน ระบบจะส่งรายละเอียดงานไปที่ช่างเทคนิคทั้งหมด เพื่อให้สามารถรับงานได้ทันที
            </p>
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className={cn(
                'flex-1 py-3 rounded-xl font-bold text-sm text-white transition-all flex items-center justify-center gap-2',
                loading || success
                  ? 'bg-blue-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-100 active:scale-[0.98]'
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  กำลังสร้าง…
                </>
              ) : success ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  เสร็จสิ้น!
                </>
              ) : (
                'สร้างงานและแจ้งเตือน'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
