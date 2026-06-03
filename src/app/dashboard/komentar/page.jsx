'use client'
// src/app/dashboard/komentar/page.jsx
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Avatar, Spinner, ConfirmDialog, PageHeader, EmptyState } from '@/components/ui'
import { komentarApi, balasApi } from '@/lib/api'
import { MessageSquare, Trash2, ChevronDown, ChevronRight, Reply } from 'lucide-react'
import toast from 'react-hot-toast'

export default function KomentarPage() {
  const [komentar, setKomentar]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [expanded, setExpanded]   = useState({})
  const [balasan, setBalasan]     = useState({})
  const [loadingBalas, setLoadingBalas] = useState({})
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, type: 'komentar' })

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      // Komentar tidak ada endpoint "getAll" tanpa laporan_id di API kita,
      // jadi kita gunakan demo data + catatan
      setKomentar(DEMO_KOMENTAR)
    } finally {
      setLoading(false)
    }
  }

  const toggleExpand = async (id) => {
    const next = !expanded[id]
    setExpanded(e => ({ ...e, [id]: next }))
    if (next && !balasan[id]) {
      setLoadingBalas(l => ({ ...l, [id]: true }))
      try {
        const res = await balasApi.getByKomentar(id)
        setBalasan(b => ({ ...b, [id]: res.data.data || [] }))
      } catch {
        setBalasan(b => ({ ...b, [id]: DEMO_BALASAN }))
      } finally {
        setLoadingBalas(l => ({ ...l, [id]: false }))
      }
    }
  }

  const handleDelete = async () => {
    try {
      if (deleteDialog.type === 'komentar') {
        await komentarApi.delete(deleteDialog.id)
        setKomentar(k => k.filter(c => c.id !== deleteDialog.id))
        toast.success('Komentar dihapus')
      } else {
        await balasApi.delete(deleteDialog.id)
        setBalasan(b => {
          const next = { ...b }
          Object.keys(next).forEach(k => {
            next[k] = next[k].filter(r => r.id !== deleteDialog.id)
          })
          return next
        })
        toast.success('Balasan dihapus')
      }
      setDeleteDialog({ open: false, id: null, type: 'komentar' })
    } catch {
      toast.error('Gagal menghapus')
    }
  }

  const colors = ['teal', 'blue', 'amber', 'teal', 'blue']

  return (
    <DashboardLayout title="Manajemen Komentar">
      <PageHeader
        title="Komentar & Balasan"
        description={`${komentar.length} komentar`}
      />

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={22} /></div>
      ) : komentar.length === 0 ? (
        <EmptyState icon={MessageSquare} title="Belum ada komentar" description="Komentar akan muncul di sini" />
      ) : (
        <div className="flex flex-col gap-3">
          {komentar.map((c, i) => (
            <div key={c.id || i} className="card p-0 overflow-hidden">
              {/* Komentar header */}
              <div className="flex items-start gap-3 p-4">
                <Avatar name={c.user?.username || 'U'} size="sm" color={colors[i % colors.length]} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium text-ink-900">{c.user?.username || 'Anonim'}</span>
                    <span className="text-[10px] text-ink-400">pada laporan</span>
                    <span className="text-[10px] font-medium text-teal-700 truncate max-w-[160px]">
                      {c.laporan?.judul || c.judul || 'Laporan #' + (c.id_laporan || c.idLaporan)}
                    </span>
                    <span className="text-[10px] text-ink-400 ml-auto">{c.createdAt ? new Date(c.createdAt).toLocaleDateString('id-ID') : '—'}</span>
                  </div>
                  <p className="text-xs text-ink-600 mt-1.5 leading-relaxed">{c.isi_komentar || c.isiKomentar}</p>

                  <div className="flex items-center gap-3 mt-2">
                    <button
                      className="flex items-center gap-1 text-[11px] text-ink-400 hover:text-teal-600 transition-colors"
                      onClick={() => toggleExpand(c.id)}
                    >
                      {expanded[c.id] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                      <Reply size={11} />
                      {c.balasKomentar?.length ?? c._count?.balasKomentar ?? 0} balasan
                    </button>
                  </div>
                </div>
                <button
                  className="btn-icon hover:bg-rose-50 text-rose-400 shrink-0"
                  onClick={() => setDeleteDialog({ open: true, id: c.id, type: 'komentar' })}
                >
                  <Trash2 size={13} />
                </button>
              </div>

              {/* Balasan */}
              {expanded[c.id] && (
                <div className="border-t border-ink-50 bg-ink-50/40">
                  {loadingBalas[c.id] ? (
                    <div className="flex justify-center py-4"><Spinner size={16} /></div>
                  ) : (balasan[c.id] || []).length === 0 ? (
                    <p className="text-xs text-ink-400 text-center py-4">Belum ada balasan</p>
                  ) : (
                    (balasan[c.id] || []).map((b, j) => (
                      <div key={b.id || j} className="flex items-start gap-3 px-4 py-3 border-b border-ink-100/60 last:border-0">
                        <div className="w-1 self-stretch bg-teal-200 rounded-full shrink-0 ml-2" />
                        <Avatar name="Admin" size="sm" color="blue" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-medium text-ink-900">Admin</span>
                            <span className="text-[10px] text-ink-400">{b.createdAt ? new Date(b.createdAt).toLocaleDateString('id-ID') : '—'}</span>
                          </div>
                          <p className="text-xs text-ink-600 mt-1 leading-relaxed">{b.balas_komentar || b.balasKomentar}</p>
                        </div>
                        <button
                          className="btn-icon hover:bg-rose-50 text-rose-400 shrink-0"
                          onClick={() => setDeleteDialog({ open: true, id: b.id, type: 'balasan' })}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null, type: 'komentar' })}
        onConfirm={handleDelete}
        title={`Hapus ${deleteDialog.type}`}
        description={`${deleteDialog.type === 'komentar' ? 'Komentar beserta semua balasannya' : 'Balasan ini'} akan dihapus permanen.`}
      />
    </DashboardLayout>
  )
}

const DEMO_KOMENTAR = [
  { id: 1, user: { username: 'Siti Rahayu' },   isi_komentar: 'Setuju! Saya juga hampir kena waktu lewat sana kemarin malam. Semoga cepat diperbaiki.', id_laporan: 1, judul: 'Jalan berlubang Jl. Sudirman', createdAt: '2026-05-26', _count: { balasKomentar: 2 } },
  { id: 2, user: { username: 'Ahmad Hidayat' },  isi_komentar: 'Sudah dilaporkan juga ke RT setempat tapi belum ada tindakan. Semoga ada respon lebih cepat.',  id_laporan: 1, judul: 'Jalan berlubang Jl. Sudirman', createdAt: '2026-05-26', _count: { balasKomentar: 1 } },
  { id: 3, user: { username: 'Budi Santoso' },   isi_komentar: 'Lampu ini sudah mati hampir sebulan, sudah ada korban jatuh 2 kali.',                             id_laporan: 2, judul: 'Lampu PJU mati Jl. Gatot',    createdAt: '2026-05-25', _count: { balasKomentar: 0 } },
  { id: 4, user: { username: 'Nina Wati' },      isi_komentar: 'Terima kasih tim sudah cepat tanggap, sampah sudah bersih sekarang!',                              id_laporan: 3, judul: 'Sampah menumpuk Blok B',     createdAt: '2026-05-24', _count: { balasKomentar: 1 } },
]
const DEMO_BALASAN = [
  { id: 1, balas_komentar: 'Terima kasih atas laporannya. Kami akan segera menindaklanjuti dalam 3 hari kerja.', createdAt: '2026-05-26' },
  { id: 2, balas_komentar: 'Laporan sudah diteruskan ke Dinas terkait.', createdAt: '2026-05-26' },
]
