'use client'
// src/app/dashboard/laporan/page.jsx
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { StatusBadge, Avatar, Spinner, ConfirmDialog, Modal, PageHeader } from '@/components/ui'
import { laporanApi, kategoriApi } from '@/lib/api'
import { Plus, Trash2, Pencil, Eye, Filter, Upload, X } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

const STATUS_OPTIONS = ['pending', 'diproses', 'selesai', 'ditolak']

export default function LaporanPage() {
  const [laporan, setLaporan] = useState([])
  const [kategori, setKategori] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ status: '', kategori_id: '', page: 1 })
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 })
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null })
  const [statusModal, setStatusModal] = useState({ open: false, laporan: null, status: '' })
  const [addModal, setAddModal] = useState(false)
  const [addForm, setAddForm] = useState({ judul: '', deskripsi: '', lokasi: '', kategori_id: '', image: null })
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadKategori() }, [])
  useEffect(() => { loadLaporan() }, [filter])

  async function loadKategori() {
    try {
      const res = await kategoriApi.getAll()
      setKategori(res.data.data || [])
    } catch { setKategori(DEMO_KAT) }
  }

  async function loadLaporan() {
    setLoading(true)
    try {
      const res = await laporanApi.getAll({ ...filter, limit: 10 })
      setLaporan(res.data.data || [])
      setMeta(res.data.meta || { total: 0, totalPages: 1 })
    } catch {
      setLaporan(DEMO_LAPORAN)
      setMeta({ total: 5, totalPages: 1 })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      await laporanApi.delete(deleteDialog.id)
      toast.success('Laporan berhasil dihapus')
      setDeleteDialog({ open: false, id: null })
      loadLaporan()
    } catch { toast.error('Gagal menghapus') }
  }

  const handleStatusUpdate = async () => {
    try {
      await laporanApi.updateStatus(statusModal.laporan.id, statusModal.status)
      toast.success('Status berhasil diperbarui')
      setStatusModal({ open: false, laporan: null, status: '' })
      loadLaporan()
    } catch { toast.error('Gagal memperbarui status') }
  }

  const handleAdd = async () => {
    if (!addForm.judul || !addForm.deskripsi || !addForm.lokasi || !addForm.kategori_id) {
      toast.error('Semua field wajib diisi'); return
    }
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(addForm).forEach(([k, v]) => v && fd.append(k, v))
      await laporanApi.create(fd)
      toast.success('Laporan berhasil ditambahkan')
      setAddModal(false)
      setAddForm({ judul: '', deskripsi: '', lokasi: '', kategori_id: '', image: null })
      loadLaporan()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Gagal menambahkan')
    } finally { setSaving(false) }
  }

  return (
    <DashboardLayout title="Manajemen Laporan" subtitle="Kelola semua laporan pengaduan masyarakat">
      <PageHeader
        title="Laporan Pengaduan"
        description={`${meta.total} total laporan`}
        action={
          <button className="btn-primary text-xs" onClick={() => setAddModal(true)}>
            <Plus size={14} /> Tambah laporan
          </button>
        }
      />

      {/* Filter bar */}
      <div className="card mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Filter size={14} className="text-ink-400" />
          <select className="form-select w-auto text-xs py-2" value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value, page: 1 }))}>
            <option value="">Semua status</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="form-select w-auto text-xs py-2" value={filter.kategori_id} onChange={e => setFilter(f => ({ ...f, kategori_id: e.target.value, page: 1 }))}>
            <option value="">Semua kategori</option>
            {kategori.map(k => <option key={k.id} value={k.id}>{k.nama_kategori || k.namaKategori}</option>)}
          </select>
          {(filter.status || filter.kategori_id) && (
            <button className="text-xs text-rose-500 flex items-center gap-1 hover:underline" onClick={() => setFilter({ status: '', kategori_id: '', page: 1 })}>
              <X size={12} /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div className="flex justify-center py-12"><Spinner size={22} /></div>
        ) : (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr><th>Laporan</th><th>Pelapor</th><th>Lokasi</th><th>Kategori</th><th>Status</th><th>Tanggal</th><th>Aksi</th></tr>
                </thead>
                <tbody>
                  {laporan.map((l, i) => (
                    <tr key={l.id || i}>
                      <td className="max-w-[200px]">
                        <div className="text-xs font-medium text-ink-900 truncate">{l.judul}</div>
                        <div className="text-[10px] text-ink-400 truncate mt-0.5">{l.deskripsi}</div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Avatar name={l.user?.username || 'U'} size="sm" />
                          <span className="text-xs text-ink-700">{l.user?.username || '—'}</span>
                        </div>
                      </td>
                      <td className="text-xs text-ink-500">{l.lokasi}</td>
                      <td className="text-xs text-ink-500">{l.kategori?.nama_kategori || l.kategori?.namaKategori || '—'}</td>
                      <td><StatusBadge status={l.status} /></td>
                      <td className="text-[10px] text-ink-400">{l.createdAt ? new Date(l.createdAt).toLocaleDateString('id-ID') : '—'}</td>
                      <td>
                        <div className="flex items-center gap-1">
                          <button className="btn-icon hover:bg-teal-50 text-teal-600"
                            onClick={() => setStatusModal({ open: true, laporan: l, status: l.status })}>
                            <Pencil size={13} />
                          </button>
                          <button className="btn-icon hover:bg-rose-50 text-rose-500"
                            onClick={() => setDeleteDialog({ open: true, id: l.id })}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-ink-50">
              <span className="text-xs text-ink-400">Halaman {filter.page} dari {meta.totalPages}</span>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(meta.totalPages, 5) }, (_, i) => i + 1).map(p => (
                  <button key={p}
                    className={`w-7 h-7 rounded-lg text-xs transition-all ${filter.page === p ? 'bg-teal-400 text-white' : 'hover:bg-ink-50 text-ink-600'}`}
                    onClick={() => setFilter(f => ({ ...f, page: p }))}
                  >{p}</button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Status modal */}
      <Modal open={statusModal.open} onClose={() => setStatusModal({ open: false, laporan: null, status: '' })}
        title="Ubah status laporan"
        footer={<>
          <button className="btn-ghost" onClick={() => setStatusModal(m => ({ ...m, open: false }))}>Batal</button>
          <button className="btn-primary" onClick={handleStatusUpdate}>Simpan</button>
        </>}
      >
        <div className="mb-2 text-xs text-ink-600">Laporan: <b>{statusModal.laporan?.judul}</b></div>
        <select className="form-select" value={statusModal.status} onChange={e => setStatusModal(m => ({ ...m, status: e.target.value }))}>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </Modal>

      {/* Add modal */}
      <Modal open={addModal} onClose={() => setAddModal(false)} title="Tambah laporan baru"
        footer={<>
          <button className="btn-ghost" onClick={() => setAddModal(false)}>Batal</button>
          <button className="btn-primary" onClick={handleAdd} disabled={saving}>
            {saving && <Spinner size={13} className="text-white" />} Simpan
          </button>
        </>}
      >
        <div className="flex flex-col gap-3">
          <div><label className="form-label">Judul</label><input className="form-input" value={addForm.judul} onChange={e => setAddForm(f => ({ ...f, judul: e.target.value }))} /></div>
          <div><label className="form-label">Deskripsi</label><textarea className="form-input" rows={3} style={{ resize: 'none' }} value={addForm.deskripsi} onChange={e => setAddForm(f => ({ ...f, deskripsi: e.target.value }))} /></div>
          <div><label className="form-label">Lokasi</label><input className="form-input" value={addForm.lokasi} onChange={e => setAddForm(f => ({ ...f, lokasi: e.target.value }))} /></div>
          <div>
            <label className="form-label">Kategori</label>
            <select className="form-select" value={addForm.kategori_id} onChange={e => setAddForm(f => ({ ...f, kategori_id: e.target.value }))}>
              <option value="">Pilih kategori</option>
              {kategori.map(k => <option key={k.id} value={k.id}>{k.nama_kategori || k.namaKategori}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Foto (opsional)</label>
            <label className="flex items-center gap-2 border border-dashed border-ink-200 rounded-xl p-3 cursor-pointer hover:border-teal-400 hover:bg-teal-50/50 transition-all">
              <Upload size={14} className="text-ink-400" />
              <span className="text-xs text-ink-500">{addForm.image ? addForm.image.name : 'Klik untuk unggah foto'}</span>
              <input type="file" accept="image/*" className="hidden" onChange={e => setAddForm(f => ({ ...f, image: e.target.files[0] }))} />
            </label>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Hapus laporan"
        description="Laporan ini beserta semua komentarnya akan dihapus permanen."
      />
    </DashboardLayout>
  )
}

const DEMO_LAPORAN = [
  { judul: 'Jalan berlubang Jl. Sudirman', deskripsi: 'Lubang besar membahayakan', lokasi: 'Kec. Menteng', status: 'diproses', user: { username: 'Budi S.' }, kategori: { namaKategori: 'Infrastruktur' } },
  { judul: 'Lampu PJU mati Jl. Gatot',     deskripsi: '12 titik lampu mati',      lokasi: 'Kec. Senen',   status: 'pending',  user: { username: 'Siti R.' },  kategori: { namaKategori: 'Keamanan' } },
  { judul: 'Sampah menumpuk Blok B',        deskripsi: '5 hari tidak diangkut',    lokasi: 'Kec. Gambir',  status: 'selesai',  user: { username: 'Ahmad H.' }, kategori: { namaKategori: 'Kebersihan' } },
  { judul: 'Drainase tersumbat RW 05',      deskripsi: 'Air meluap saat hujan',    lokasi: 'Tanah Abang',  status: 'diproses', user: { username: 'Nina W.' },  kategori: { namaKategori: 'Infrastruktur' } },
  { judul: 'Fasilitas taman rusak',         deskripsi: 'Bangku dan pagar rusak',   lokasi: 'Kec. Cikini',  status: 'ditolak',  user: { username: 'Dewi K.' },  kategori: { namaKategori: 'Pelayanan' } },
]
const DEMO_KAT = [
  { id: 1, namaKategori: 'Infrastruktur Jalan' },
  { id: 2, namaKategori: 'Kebersihan & Sampah' },
  { id: 3, namaKategori: 'Keamanan' },
  { id: 4, namaKategori: 'Pelayanan Publik' },
]
