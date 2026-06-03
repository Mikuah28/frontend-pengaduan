'use client'
// src/app/laporan/buat/page.jsx
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import { laporanApi, kategoriApi } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { Spinner } from '@/components/ui'
import { Upload, MapPin, Tag, FileText, AlignLeft, X, ArrowLeft, Send } from 'lucide-react'
import toast from 'react-hot-toast'

export default function BuatLaporanPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [kategori, setKategori] = useState([])
  const [form, setForm] = useState({ judul: '', deskripsi: '', lokasi: '', kategori_id: '', prioritas: 'Normal' })
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    kategoriApi.getAll().then(r => setKategori(r.data.data || [])).catch(() => setKategori(DEMO_KAT))
  }, [user])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Ukuran file max 5MB'); return }
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.judul || !form.deskripsi || !form.lokasi || !form.kategori_id) {
      toast.error('Semua field wajib diisi'); return
    }
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('judul', form.judul)
      fd.append('deskripsi', form.deskripsi)
      fd.append('lokasi', form.lokasi)
      fd.append('kategori_id', form.kategori_id)
      if (image) fd.append('image', image)
      const res = await laporanApi.create(fd)
      toast.success('Laporan berhasil dikirim!')
      router.push(`/laporan/${res.data.data?.id || ''}`)
    } catch (e) {
      toast.error(e.response?.data?.message || 'Gagal mengirim laporan')
    } finally { setSaving(false) }
  }

  return (
    <div className="min-h-screen bg-ink-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-xs text-ink-500 hover:text-ink-900 transition-colors mb-5">
          <ArrowLeft size={14} /> Kembali
        </button>

        <div className="bg-white rounded-2xl border border-ink-100/60 overflow-hidden">
          <div className="px-5 py-4 border-b border-ink-50">
            <h1 className="text-base font-medium text-ink-900">Buat laporan baru</h1>
            <p className="text-xs text-ink-400 mt-0.5">Lengkapi informasi laporan dengan detail yang akurat</p>
          </div>

          <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-5">
            {/* Image upload */}
            <div>
              <label className="form-label">Foto pendukung (opsional)</label>
              {preview ? (
                <div className="relative h-40 rounded-xl overflow-hidden bg-ink-100">
                  <img src={preview} alt="preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    className="absolute top-2 right-2 w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow text-ink-500 hover:text-rose-500 transition-colors"
                    onClick={() => { setImage(null); setPreview(null) }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-36 border border-dashed border-ink-200 rounded-xl cursor-pointer hover:border-teal-400 hover:bg-teal-50/30 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-ink-100 group-hover:bg-teal-100 flex items-center justify-center mb-2 transition-colors">
                    <Upload size={18} className="text-ink-400 group-hover:text-teal-600 transition-colors" />
                  </div>
                  <span className="text-xs font-medium text-ink-600">Klik untuk unggah foto</span>
                  <span className="text-[10px] text-ink-400 mt-0.5">JPG, PNG, WEBP — maks. 5MB</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
                </label>
              )}
            </div>

            {/* Judul */}
            <div>
              <label className="form-label">
                Judul laporan <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <FileText size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  className="form-input pl-9"
                  placeholder="Contoh: Jalan rusak di Jl. Sudirman"
                  maxLength={100}
                  value={form.judul}
                  onChange={set('judul')}
                />
              </div>
              <div className="text-[10px] text-ink-400 text-right mt-1">{form.judul.length} / 100</div>
            </div>

            {/* Deskripsi */}
            <div>
              <label className="form-label">
                Deskripsi lengkap <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <AlignLeft size={14} className="absolute left-3 top-3 text-ink-400" />
                <textarea
                  className="form-input pl-9 resize-none"
                  rows={4}
                  placeholder="Deskripsikan masalah secara detail: ukuran, lokasi tepat, dampak, sudah berapa lama, dll."
                  maxLength={500}
                  value={form.deskripsi}
                  onChange={set('deskripsi')}
                />
              </div>
              <div className="text-[10px] text-ink-400 text-right mt-1">{form.deskripsi.length} / 500</div>
            </div>

            {/* Kategori + Prioritas */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Kategori <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                  <select className="form-select pl-9" value={form.kategori_id} onChange={set('kategori_id')}>
                    <option value="">Pilih kategori</option>
                    {kategori.map(k => (
                      <option key={k.id} value={k.id}>{k.nama_kategori || k.namaKategori}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="form-label">Prioritas</label>
                <select className="form-select" value={form.prioritas} onChange={set('prioritas')}>
                  <option>Normal</option>
                  <option>Mendesak</option>
                  <option>Darurat</option>
                </select>
              </div>
            </div>

            {/* Lokasi */}
            <div>
              <label className="form-label">Lokasi kejadian <span className="text-rose-500">*</span></label>
              <div className="relative">
                <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  className="form-input pl-9"
                  placeholder="Contoh: Jl. Sudirman No. 45, Kec. Menteng"
                  value={form.lokasi}
                  onChange={set('lokasi')}
                />
              </div>
            </div>

            {/* Info box */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-blue-600 text-xs font-bold">i</span>
              </div>
              <p className="text-xs text-blue-700 leading-relaxed">
                Laporan yang lengkap dengan foto akan diproses lebih cepat. Pastikan data yang Anda masukkan akurat dan dapat dipertanggungjawabkan.
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2 border-t border-ink-50">
              <button type="button" className="btn-ghost" onClick={() => router.back()}>Batal</button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? <Spinner size={14} className="text-white" /> : <Send size={14} />}
                {saving ? 'Mengirim...' : 'Kirim laporan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

const DEMO_KAT = [
  { id: 1, namaKategori: 'Infrastruktur Jalan' },
  { id: 2, namaKategori: 'Kebersihan & Sampah' },
  { id: 3, namaKategori: 'Keamanan' },
  { id: 4, namaKategori: 'Pelayanan Publik' },
  { id: 5, namaKategori: 'Listrik & Air' },
]
