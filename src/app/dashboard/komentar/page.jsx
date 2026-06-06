'use client'
// src/app/dashboard/komentar/page.jsx
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Avatar, Spinner, ConfirmDialog, PageHeader, EmptyState, Pagination } from '@/components/ui'
import { komentarApi, balasApi } from '@/lib/api'
import { MessageSquare, Trash2, ChevronDown, ChevronRight, Reply, ChevronLeft } from 'lucide-react'
import toast from 'react-hot-toast'

const UPLOAD_URL = process.env.NEXT_PUBLIC_UPLOAD_URL || 'http://localhost:5000/uploads/images'

export default function KomentarPage() {
  const [komentar, setKomentar] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 })
  const [expanded, setExpanded] = useState({})
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, type: 'komentar' })

  useEffect(() => { load() }, [page])

  async function load() {
    setLoading(true)
    try {
      const res = await komentarApi.getAll({ page, limit: 10 })
      setKomentar(res.data.data || [])
      setMeta(res.data.meta || { total: 0, totalPages: 1 })
    } catch {
      setKomentar(DEMO_KOMENTAR)
      setMeta({ total: DEMO_KOMENTAR.length, totalPages: 1 })
    } finally {
      setLoading(false)
    }
  }

  const toggleExpand = (id) => {
    setExpanded(e => ({ ...e, [id]: !e[id] }))
  }

  const handleDelete = async () => {
    try {
      if (deleteDialog.type === 'komentar') {
        await komentarApi.delete(deleteDialog.id)
        setKomentar(k => k.filter(c => c.id !== deleteDialog.id))
        setMeta(m => ({ ...m, total: m.total - 1 }))
        toast.success('Komentar dihapus')
      } else {
        await balasApi.delete(deleteDialog.id)
        // Remove the reply from the embedded data
        setKomentar(prev => prev.map(c => ({
          ...c,
          balasKomentar: (c.balasKomentar || []).filter(b => b.id !== deleteDialog.id),
          _count: {
            ...c._count,
            balasKomentar: Math.max(0, (c._count?.balasKomentar || 1) - 1),
          },
        })))
        toast.success('Balasan dihapus')
      }
      setDeleteDialog({ open: false, id: null, type: 'komentar' })
    } catch {
      toast.error('Gagal menghapus')
    }
  }

  const avatarColors = ['teal', 'blue', 'amber', 'teal', 'blue']

  return (
    <DashboardLayout title="Manajemen Komentar" subtitle="Kelola semua komentar dan balasan">
      <PageHeader
        title="Komentar & Balasan"
        description={`${meta.total} komentar`}
      />

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={22} /></div>
      ) : komentar.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="Belum ada komentar"
          description="Komentar akan muncul di sini"
        />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {komentar.map((c, i) => {
              const replyCount = c._count?.balasKomentar ?? c.balasKomentar?.length ?? 0
              const replies = c.balasKomentar || []
              const isOpen = !!expanded[c.id]

              return (
                <div key={c.id || i} className="card p-0 overflow-hidden">
                  {/* Komentar row */}
                  <div className="flex items-start gap-3 p-4">
                    {c.user?.foto_profil
                      ? <img
                        src={`${UPLOAD_URL}/${c.user.foto_profil}`}
                        alt={c.user.username}
                        className="size-7 rounded-full object-cover shrink-0"
                      />
                      : <Avatar name={c.user?.username || 'U'} size="sm" color={avatarColors[i % avatarColors.length]} />
                    }

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-medium text-ink-900">
                          {c.user?.username || 'Anonim'}
                        </span>
                        <span className="text-[10px] text-ink-400">pada laporan</span>
                        <span className="text-[10px] font-medium text-teal-700 truncate max-w-[160px]">
                          {c.laporan?.judul || 'Laporan #' + (c.id_laporan || c.idLaporan)}
                        </span>
                        <span className="text-[10px] text-ink-400 ml-auto">
                          {(c.created_at || c.createdAt)
                            ? new Date(c.created_at || c.createdAt).toLocaleDateString('id-ID')
                            : '—'}
                        </span>
                      </div>
                      <p className="text-xs text-ink-600 mt-1.5 leading-relaxed">
                        {c.isi_komentar || c.isiKomentar}
                      </p>

                      {/* Toggle replies */}
                      <button
                        className="flex items-center gap-1 text-[11px] text-ink-400 hover:text-teal-600 transition-colors mt-2"
                        onClick={() => toggleExpand(c.id)}
                      >
                        {isOpen
                          ? <ChevronDown size={12} />
                          : <ChevronRight size={12} />
                        }
                        <Reply size={11} />
                        {replyCount} balasan
                      </button>
                    </div>

                    <button
                      className="btn-icon hover:bg-rose-50 text-rose-400 shrink-0"
                      onClick={() => setDeleteDialog({ open: true, id: c.id, type: 'komentar' })}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {/* Replies */}
                  {isOpen && (
                    <div className="border-t border-ink-50 bg-ink-50/40">
                      {replies.length === 0 ? (
                        <p className="text-xs text-ink-400 text-center py-4">Belum ada balasan</p>
                      ) : (
                        replies.map((b, j) => (
                          <div
                            key={b.id || j}
                            className="flex items-start gap-3 px-4 py-3 border-b border-ink-100/60 last:border-0"
                          >
                            <div className="w-1 self-stretch bg-teal-200 rounded-full shrink-0 ml-2" />
                            {b.user?.foto_profil
                              ? <img
                                src={`${UPLOAD_URL}/${b.user.foto_profil}`}
                                alt={b.user.username}
                                className="size-7 rounded-full object-cover shrink-0"
                              />
                              : <Avatar name={b.user?.username || 'U'} size="sm" color="blue" />
                            }
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-medium text-ink-900">
                                  {b.user?.username || 'Admin'}
                                </span>
                                <span className="text-[10px] text-ink-400">
                                  {(b.created_at || b.createdAt)
                                    ? new Date(b.created_at || b.createdAt).toLocaleDateString('id-ID')
                                    : '—'}
                                </span>
                              </div>
                              <p className="text-xs text-ink-600 mt-1 leading-relaxed">
                                {b.balas_komentar || b.balasKomentar}
                              </p>
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
              )
            })}
          </div>

          <div className='card p-4 mt-3'>
            <div className="flex items-center justify-between">
              <span className="text-xs text-ink-400">Halaman {page} dari {meta.totalPages}</span>
              {/* Pagination */}
              <div className="flex items-center gap-1">
                <button
                  disabled={meta.page === 1}
                  className={`w-7 h-7 rounded-lg text-xs transition-all flex justify-center items-center ${meta.page === meta.page ? 'bg-teal-400 text-white' : 'hover:bg-ink-50 text-ink-600'}`}
                  onClick={() => setPage(meta.page - 1)}
                >
                  <ChevronLeft />
                </button>
                <div className={`w-7 h-7 rounded-lg text-xs transition-all flex justify-center items-center text-ink-600`}>
                  {meta.page}
                </div>
                <button
                  disabled={meta.page === meta.totalPages}
                  className={`w-7 h-7 rounded-lg text-xs transition-all flex justify-center items-center ${meta.page === meta.page ? 'bg-teal-400 text-white' : 'hover:bg-ink-50 text-ink-600'}`}
                  onClick={() => setPage(meta.page + 1)}
                >
                  <ChevronRight />
                </button>
              </div>
            </div>
          </div>
        </>
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

// ── Demo fallback ─────────────────────────────────────────────────────────────
const DEMO_KOMENTAR = [
  {
    id: 1,
    user: { username: 'Siti Rahayu' },
    isi_komentar: 'Setuju! Saya juga hampir kena waktu lewat sana kemarin malam. Semoga cepat diperbaiki.',
    id_laporan: 1,
    laporan: { judul: 'Jalan berlubang Jl. Sudirman' },
    created_at: '2026-05-26',
    balasKomentar: [
      { id: 1, user: { username: 'Admin' }, balas_komentar: 'Terima kasih atas laporannya, akan kami tindaklanjuti.', created_at: '2026-05-26' },
    ],
    _count: { balasKomentar: 1 },
  },
  {
    id: 2,
    user: { username: 'Ahmad Hidayat' },
    isi_komentar: 'Sudah dilaporkan juga ke RT setempat tapi belum ada tindakan.',
    id_laporan: 1,
    laporan: { judul: 'Jalan berlubang Jl. Sudirman' },
    created_at: '2026-05-26',
    balasKomentar: [],
    _count: { balasKomentar: 0 },
  },
  {
    id: 3,
    user: { username: 'Budi Santoso' },
    isi_komentar: 'Lampu ini sudah mati hampir sebulan, sudah ada korban jatuh 2 kali.',
    id_laporan: 2,
    laporan: { judul: 'Lampu PJU mati Jl. Gatot' },
    created_at: '2026-05-25',
    balasKomentar: [],
    _count: { balasKomentar: 0 },
  },
]
