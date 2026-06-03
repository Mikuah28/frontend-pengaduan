'use client'
// src/app/dashboard/kategori/page.jsx
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Spinner, Modal, ConfirmDialog, PageHeader } from '@/components/ui'
import { kategoriApi } from '@/lib/api'
import { Plus, Trash2, Pencil, Tag } from 'lucide-react'
import toast from 'react-hot-toast'

export default function KategoriPage() {
  const [kategori, setKategori] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState({ open: false, mode: 'create', data: null })
  const [form, setForm] = useState({ nama_kategori: '' })
  const [saving, setSaving] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null })

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const res = await kategoriApi.getAll()
      setKategori(res.data.data || [])
    } catch {
      setKategori(DEMO)
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setForm({ nama_kategori: '' })
    setModal({ open: true, mode: 'create', data: null })
  }
  const openEdit = (k) => {
    setForm({ nama_kategori: k.nama_kategori || k.namaKategori })
    setModal({ open: true, mode: 'edit', data: k })
  }

  const handleSave = async () => {
    if (!form.nama_kategori.trim()) { toast.error('Nama kategori wajib diisi'); return }
    setSaving(true)
    try {
      if (modal.mode === 'create') {
        await kategoriApi.create(form)
        toast.success('Kategori berhasil ditambahkan')
      } else {
        await kategoriApi.update(modal.data.id, form)
        toast.success('Kategori berhasil diupdate')
      }
      setModal(m => ({ ...m, open: false }))
      load()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Gagal menyimpan')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try {
      await kategoriApi.delete(deleteDialog.id)
      toast.success('Kategori berhasil dihapus')
      setDeleteDialog({ open: false, id: null })
      load()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Gagal menghapus')
    }
  }

  const ICONS = ['🛣️', '🗑️', '🛡️', '🏛️', '⚡', '💧', '🌊', '🔧']

  return (
    <DashboardLayout title="Manajemen Kategori">
      <PageHeader
        title="Kategori Laporan"
        description={`${kategori.length} kategori tersedia`}
        action={
          <button className="btn-primary text-xs" onClick={openCreate}>
            <Plus size={14} /> Tambah kategori
          </button>
        }
      />

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={22} /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {kategori.map((k, i) => (
            <div key={k.id || i} className="card group hover:border-teal-200 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-xl">
                    {ICONS[i % ICONS.length]}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-ink-900">{k.nama_kategori || k.namaKategori}</div>
                    <div className="text-xs text-ink-400 mt-0.5">
                      {k._count?.laporan ?? Math.floor(Math.random() * 100) + 10} laporan
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="btn-icon hover:bg-blue-50 text-blue-600" onClick={() => openEdit(k)}><Pencil size={13} /></button>
                  <button className="btn-icon hover:bg-rose-50 text-rose-500" onClick={() => setDeleteDialog({ open: true, id: k.id })}><Trash2 size={13} /></button>
                </div>
              </div>

              {/* mini progress */}
              <div className="mt-4">
                <div className="flex justify-between text-[10px] text-ink-400 mb-1">
                  <span>Laporan selesai</span>
                  <span>{Math.floor(Math.random() * 40) + 60}%</span>
                </div>
                <div className="h-1.5 bg-ink-100 rounded-full">
                  <div className="h-full bg-gradient-to-r from-teal-400 to-blue-400 rounded-full"
                    style={{ width: `${Math.floor(Math.random() * 40) + 60}%` }} />
                </div>
              </div>
            </div>
          ))}

          {/* Add card */}
          <button
            className="card border-dashed border-ink-200 hover:border-teal-400 hover:bg-teal-50/30 transition-all flex flex-col items-center justify-center gap-2 py-8 cursor-pointer"
            onClick={openCreate}
          >
            <div className="w-10 h-10 rounded-xl bg-ink-100 flex items-center justify-center">
              <Plus size={18} className="text-ink-400" />
            </div>
            <span className="text-xs text-ink-500">Tambah kategori baru</span>
          </button>
        </div>
      )}

      <Modal
        open={modal.open}
        onClose={() => setModal(m => ({ ...m, open: false }))}
        title={modal.mode === 'create' ? 'Tambah kategori' : 'Edit kategori'}
        footer={<>
          <button className="btn-ghost" onClick={() => setModal(m => ({ ...m, open: false }))}>Batal</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving && <Spinner size={13} className="text-white" />}
            {modal.mode === 'create' ? 'Tambah' : 'Simpan'}
          </button>
        </>}
      >
        <div>
          <label className="form-label">Nama kategori</label>
          <input className="form-input" placeholder="Contoh: Infrastruktur Jalan"
            value={form.nama_kategori}
            onChange={e => setForm({ nama_kategori: e.target.value })} />
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Hapus kategori"
        description="Semua laporan dalam kategori ini tidak akan terhapus, namun tidak memiliki kategori."
      />
    </DashboardLayout>
  )
}

const DEMO = [
  { id: 1, namaKategori: 'Infrastruktur Jalan' },
  { id: 2, namaKategori: 'Kebersihan & Sampah' },
  { id: 3, namaKategori: 'Keamanan' },
  { id: 4, namaKategori: 'Pelayanan Publik' },
  { id: 5, namaKategori: 'Listrik & Air' },
  { id: 6, namaKategori: 'Lainnya' },
]
