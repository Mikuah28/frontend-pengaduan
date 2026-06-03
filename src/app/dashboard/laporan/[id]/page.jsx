'use client'
// src/app/dashboard/laporan/[id]/page.jsx
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { StatusBadge, Avatar, Spinner, Modal } from '@/components/ui'
import { laporanApi, komentarApi, balasApi } from '@/lib/api'
import {
  ArrowLeft, MapPin, Calendar, Tag, User,
  MessageSquare, Trash2, Send, CheckCircle,
  ChevronDown, ChevronRight, Reply, Pencil
} from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const STATUS_LIST = ['pending', 'diproses', 'selesai', 'ditolak']
const UPLOAD_URL  = process.env.NEXT_PUBLIC_UPLOAD_URL || 'http://localhost:5000/uploads/images'

export default function DashboardDetailLaporan() {
  const { id }   = useParams()
  const router   = useRouter()

  const [laporan,  setLaporan]  = useState(null)
  const [komentar, setKomentar] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [expanded, setExpanded] = useState({})
  const [balasan,  setBalasan]  = useState({})

  const [statusModal, setStatusModal] = useState({ open: false, status: '' })
  const [replyModal,  setReplyModal]  = useState({ open: false, komentarId: null })
  const [replyText,   setReplyText]   = useState('')
  const [delDialog,   setDelDialog]   = useState({ open: false, id: null, type: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [id])

  async function load() {
    setLoading(true)
    try {
      const [lRes, kRes] = await Promise.all([
        laporanApi.getById(id),
        komentarApi.getByLaporan(id),
      ])
      setLaporan(lRes.data.data)
      setKomentar(kRes.data.data || [])
    } catch {
      setLaporan(DEMO_LAPORAN)
      setKomentar(DEMO_KOMENTAR)
    } finally {
      setLoading(false)
    }
  }

  // ── Status update ─────────────────────────────────────────────────────────
  const handleStatusUpdate = async () => {
    setSaving(true)
    try {
      await laporanApi.updateStatus(id, statusModal.status)
      toast.success('Status diperbarui')
      setStatusModal({ open: false, status: '' })
      load()
    } catch { toast.error('Gagal memperbarui status') }
    finally   { setSaving(false) }
  }

  // ── Reply komentar ────────────────────────────────────────────────────────
  const handleReply = async () => {
    if (!replyText.trim()) return
    setSaving(true)
    try {
      await balasApi.create({ id_komentar: replyModal.komentarId, balas_komentar: replyText })
      toast.success('Balasan dikirim')
      setReplyModal({ open: false, komentarId: null })
      setReplyText('')
      load()
    } catch {
      toast.success('Balasan dikirim (demo)')
      setReplyModal({ open: false, komentarId: null })
      setReplyText('')
    } finally { setSaving(false) }
  }

  // ── Delete komentar / balasan ─────────────────────────────────────────────
  const handleDelete = async () => {
    try {
      if (delDialog.type === 'komentar') {
        await komentarApi.delete(delDialog.id)
        setKomentar(k => k.filter(c => c.id !== delDialog.id))
        toast.success('Komentar dihapus')
      } else {
        await balasApi.delete(delDialog.id)
        toast.success('Balasan dihapus')
        load()
      }
      setDelDialog({ open: false, id: null, type: '' })
    } catch { toast.error('Gagal menghapus') }
  }

  // ── Expand balasan ────────────────────────────────────────────────────────
  const toggleExpand = async (komentarId) => {
    const next = !expanded[komentarId]
    setExpanded(e => ({ ...e, [komentarId]: next }))
    if (next && !balasan[komentarId]) {
      try {
        const res = await balasApi.getByKomentar(komentarId)
        setBalasan(b => ({ ...b, [komentarId]: res.data.data || [] }))
      } catch {
        setBalasan(b => ({ ...b, [komentarId]: DEMO_BALASAN }))
      }
    }
  }

  const progressMap = { pending: 10, menunggu: 10, diproses: 55, selesai: 100, ditolak: 0 }
  const pct = progressMap[laporan?.status] || 0

  if (loading) return (
    <DashboardLayout title="Detail Laporan">
      <div className="flex justify-center py-24"><Spinner size={24} /></div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout title="Detail Laporan" subtitle={`#LPR-${id}`}>
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-xs text-ink-500 hover:text-ink-900 transition-colors mb-5"
      >
        <ArrowLeft size={14} /> Kembali ke daftar
      </button>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* ── Main ── */}
        <div className="xl:col-span-2 flex flex-col gap-4">

          {/* Laporan card */}
          <div className="card p-0 overflow-hidden">
            {/* Header */}
            <div className="flex items-start gap-3 p-5 pb-4 border-b border-ink-50">
              <Avatar name={laporan?.user?.username || 'U'} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-ink-900">{laporan?.user?.username || '—'}</span>
                  <span className="text-[10px] text-ink-400">{laporan?.user?.email || '—'}</span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-[11px] text-ink-400 flex-wrap">
                  <span className="flex items-center gap-1"><MapPin size={10} />{laporan?.lokasi}</span>
                  <span className="flex items-center gap-1"><Calendar size={10} />{laporan?.createdAt ? new Date(laporan.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}</span>
                </div>
              </div>
              <StatusBadge status={laporan?.status} />
            </div>

            {/* Image */}
            {laporan?.gambar ? (
              <div className="h-52 bg-ink-100 overflow-hidden">
                <img src={`${UPLOAD_URL}/${laporan.gambar}`} alt={laporan.judul} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="h-32 bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center text-5xl border-b border-ink-50">
                🛣️
              </div>
            )}

            {/* Content */}
            <div className="p-5">
              <div className="flex items-center gap-2 mb-3">
                {laporan?.kategori && (
                  <span className="badge badge-diproses text-[11px]">
                    <Tag size={10} className="mr-1" />
                    {laporan.kategori.nama_kategori || laporan.kategori.namaKategori}
                  </span>
                )}
                <span className="text-[10px] text-ink-400">#LPR-{id}</span>
              </div>

              <h2 className="text-base font-medium text-ink-900 mb-3 leading-snug">{laporan?.judul}</h2>
              <p className="text-sm text-ink-600 leading-relaxed">{laporan?.deskripsi}</p>

              {/* Info grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
                {[
                  { icon: User,     label: 'Pelapor',  value: laporan?.user?.username },
                  { icon: MapPin,   label: 'Lokasi',   value: laporan?.lokasi },
                  { icon: Tag,      label: 'Kategori', value: laporan?.kategori?.nama_kategori || laporan?.kategori?.namaKategori },
                  { icon: Calendar, label: 'Tanggal',  value: laporan?.createdAt ? new Date(laporan.createdAt).toLocaleDateString('id-ID') : '—' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-ink-50 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 text-[10px] text-ink-400 mb-1">
                      <Icon size={10} /> {label}
                    </div>
                    <div className="text-xs font-medium text-ink-800 truncate">{value || '—'}</div>
                  </div>
                ))}
              </div>

              {/* Progress */}
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-ink-500">Progress penanganan</span>
                  <span className="font-medium text-teal-700">{pct}%</span>
                </div>
                <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-400 to-blue-500 rounded-full transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Footer action */}
            <div className="px-5 py-3 border-t border-ink-50 flex items-center gap-2">
              <button
                className="btn-primary text-xs"
                onClick={() => setStatusModal({ open: true, status: laporan?.status || 'pending' })}
              >
                <Pencil size={13} /> Ubah status
              </button>
              <button
                className="btn-danger text-xs"
                onClick={async () => {
                  if (!confirm('Hapus laporan ini?')) return
                  try {
                    await laporanApi.delete(id)
                    toast.success('Laporan dihapus')
                    router.push('/dashboard/laporan')
                  } catch { toast.error('Gagal menghapus') }
                }}
              >
                <Trash2 size={13} /> Hapus
              </button>
            </div>
          </div>

          {/* ── Komentar ── */}
          <div className="card p-0 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-ink-50">
              <span className="text-sm font-medium text-ink-900 flex items-center gap-2">
                <MessageSquare size={15} className="text-ink-400" />
                Komentar
                <span className="text-xs text-ink-400 font-normal">({komentar.length})</span>
              </span>
            </div>

            {komentar.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center">
                <MessageSquare size={22} className="text-ink-300 mb-2" />
                <div className="text-xs text-ink-400">Belum ada komentar</div>
              </div>
            ) : (
              <div className="divide-y divide-ink-50">
                {komentar.map((c, i) => (
                  <div key={c.id || i} className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar name={c.user?.username || 'U'} size="sm" color={i % 2 === 0 ? 'teal' : 'blue'} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-medium text-ink-900">{c.user?.username || 'Anonim'}</span>
                          <span className="text-[10px] text-ink-400">
                            {c.createdAt ? new Date(c.createdAt).toLocaleDateString('id-ID') : '—'}
                          </span>
                        </div>
                        <p className="text-xs text-ink-600 mt-1.5 leading-relaxed">{c.isi_komentar || c.isiKomentar}</p>

                        <div className="flex items-center gap-2 mt-2">
                          <button
                            className="flex items-center gap-1 text-[11px] text-ink-400 hover:text-teal-600 px-2 py-1 rounded-lg hover:bg-teal-50 transition-all"
                            onClick={() => setReplyModal({ open: true, komentarId: c.id })}
                          >
                            <Reply size={11} /> Balas
                          </button>
                          {((c.balasKomentar?.length || 0) + (balasan[c.id]?.length || 0)) > 0 && (
                            <button
                              className="flex items-center gap-1 text-[11px] text-ink-400 hover:text-ink-700 px-2 py-1 rounded-lg hover:bg-ink-50 transition-all"
                              onClick={() => toggleExpand(c.id)}
                            >
                              {expanded[c.id] ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                              {(c.balasKomentar?.length || balasan[c.id]?.length || 0)} balasan
                            </button>
                          )}
                          <button
                            className="ml-auto btn-icon hover:bg-rose-50 text-rose-400 w-7 h-7"
                            onClick={() => setDelDialog({ open: true, id: c.id, type: 'komentar' })}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>

                        {/* Balasan list */}
                        {expanded[c.id] && (
                          <div className="mt-3 pl-3 border-l-2 border-teal-100 flex flex-col gap-3">
                            {(balasan[c.id] || c.balasKomentar || []).map((r, j) => (
                              <div key={r.id || j} className="flex items-start gap-2">
                                <Avatar name="Admin" size="sm" color="blue" />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-medium text-ink-900">Admin</span>
                                    <span className="badge badge-admin text-[9px]">Admin</span>
                                    <span className="text-[10px] text-ink-400">
                                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString('id-ID') : '—'}
                                    </span>
                                  </div>
                                  <p className="text-xs text-ink-600 mt-1 leading-relaxed">{r.balas_komentar || r.balasKomentar}</p>
                                </div>
                                <button
                                  className="btn-icon hover:bg-rose-50 text-rose-400 w-6 h-6 shrink-0"
                                  onClick={() => setDelDialog({ open: true, id: r.id, type: 'balasan' })}
                                >
                                  <Trash2 size={11} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="flex flex-col gap-4">
          {/* Status card */}
          <div className="card">
            <div className="text-xs font-medium text-ink-600 mb-3">Status laporan</div>
            <div className="flex items-center gap-2 mb-4">
              <StatusBadge status={laporan?.status} />
              <span className="text-xs text-ink-500 capitalize">{laporan?.status}</span>
            </div>
            <div className="flex flex-col gap-2 mb-4">
              {STATUS_LIST.map(s => (
                <div key={s} className={clsx('flex items-center gap-2 text-xs',
                  laporan?.status === s ? 'text-teal-700 font-medium' : 'text-ink-400'
                )}>
                  <CheckCircle size={13} className={laporan?.status === s ? 'text-teal-400' : 'text-ink-200'} />
                  <span className="capitalize">{s}</span>
                </div>
              ))}
            </div>
            <button
              className="btn-primary text-xs w-full justify-center"
              onClick={() => setStatusModal({ open: true, status: laporan?.status || 'pending' })}
            >
              <Pencil size={13} /> Ubah status
            </button>
          </div>

          {/* Pelapor */}
          <div className="card">
            <div className="text-xs font-medium text-ink-600 mb-3">Informasi pelapor</div>
            <div className="flex items-center gap-3 mb-3">
              <Avatar name={laporan?.user?.username || 'U'} size="md" />
              <div>
                <div className="text-sm font-medium text-ink-900">{laporan?.user?.username || '—'}</div>
                <div className="text-[11px] text-ink-400">{laporan?.user?.email || '—'}</div>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="card">
            <div className="text-xs font-medium text-ink-600 mb-3">Aksi cepat</div>
            <div className="flex flex-col gap-2">
              <button
                className="btn-primary text-xs justify-center"
                onClick={() => setStatusModal({ open: true, status: 'selesai' })}
              >
                <CheckCircle size={13} /> Tandai selesai
              </button>
              <button
                className="btn-ghost text-xs justify-center"
                onClick={() => setReplyModal({ open: true, komentarId: komentar[0]?.id || null })}
              >
                <Send size={13} /> Tambah komentar resmi
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal ubah status ── */}
      <Modal
        open={statusModal.open}
        onClose={() => setStatusModal({ open: false, status: '' })}
        title="Ubah status laporan"
        footer={<>
          <button className="btn-ghost" onClick={() => setStatusModal({ open: false, status: '' })}>Batal</button>
          <button className="btn-primary" onClick={handleStatusUpdate} disabled={saving}>
            {saving && <Spinner size={13} className="text-white" />} Simpan
          </button>
        </>}
      >
        <p className="text-xs text-ink-500 mb-3">Laporan: <b>{laporan?.judul}</b></p>
        <select
          className="form-select"
          value={statusModal.status}
          onChange={e => setStatusModal(m => ({ ...m, status: e.target.value }))}
        >
          {STATUS_LIST.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
      </Modal>

      {/* ── Modal balas komentar ── */}
      <Modal
        open={replyModal.open}
        onClose={() => { setReplyModal({ open: false, komentarId: null }); setReplyText('') }}
        title="Balas komentar"
        footer={<>
          <button className="btn-ghost" onClick={() => { setReplyModal({ open: false, komentarId: null }); setReplyText('') }}>Batal</button>
          <button className="btn-primary" onClick={handleReply} disabled={saving || !replyText.trim()}>
            {saving && <Spinner size={13} className="text-white" />}
            <Send size={13} /> Kirim balasan
          </button>
        </>}
      >
        <textarea
          className="form-input resize-none"
          rows={4}
          placeholder="Tulis balasan resmi..."
          value={replyText}
          onChange={e => setReplyText(e.target.value)}
          autoFocus
        />
      </Modal>

      {/* ── Confirm delete ── */}
      {delDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-ink-100/60 w-full max-w-sm p-5 shadow-lg animate-fade-up">
            <h3 className="text-sm font-medium text-ink-900 mb-2">Hapus {delDialog.type}</h3>
            <p className="text-xs text-ink-500 mb-5">
              {delDialog.type === 'komentar' ? 'Komentar beserta semua balasannya' : 'Balasan ini'} akan dihapus permanen.
            </p>
            <div className="flex justify-end gap-2">
              <button className="btn-ghost" onClick={() => setDelDialog({ open: false, id: null, type: '' })}>Batal</button>
              <button className="btn-danger" onClick={handleDelete}>Hapus</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

const DEMO_LAPORAN = {
  id: 1,
  judul: 'Jalan berlubang besar di Jl. Sudirman No. 45 membahayakan pengendara',
  deskripsi: 'Terdapat lubang dengan diameter sekitar 50cm dan kedalaman 20cm yang sangat membahayakan pengendara motor maupun mobil, terutama saat malam hari. Kejadian ini sudah berlangsung selama 2 minggu.',
  lokasi: 'Jl. Sudirman No. 45, Menteng',
  status: 'diproses',
  user: { username: 'Budi Santoso', email: 'budi@gmail.com' },
  kategori: { namaKategori: 'Infrastruktur Jalan' },
  createdAt: new Date(Date.now() - 7200000).toISOString(),
}
const DEMO_KOMENTAR = [
  {
    id: 1,
    user: { username: 'Siti Rahayu' },
    isi_komentar: 'Setuju! Saya juga hampir kena waktu lewat sana kemarin malam. Semoga cepat diperbaiki.',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    balasKomentar: [
      { id: 1, balas_komentar: 'Terima kasih. Laporan sudah diteruskan ke Dinas terkait.', createdAt: new Date().toISOString() }
    ]
  },
  {
    id: 2,
    user: { username: 'Ahmad Hidayat' },
    isi_komentar: 'Sudah dilaporkan juga ke RT setempat tapi belum ada tindakan.',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    balasKomentar: []
  },
]
const DEMO_BALASAN = [
  { id: 1, balas_komentar: 'Terima kasih atas informasinya. Kami segera tindaklanjuti.', createdAt: new Date().toISOString() },
]
