'use client'
// src/app/laporan/[id]/page.jsx
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import { Avatar, StatusBadge, Spinner, EmptyState } from '@/components/ui'
import { laporanApi, komentarApi, balasApi } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import {
  Heart, MessageCircle, Share2, Bookmark, MapPin, Clock,
  ThumbsUp, ThumbsDown, Reply, Send, ArrowLeft, Flag,
  ChevronDown, ChevronRight, Loader
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import { formatDistanceToNow } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

const UPLOAD_URL = process.env.NEXT_PUBLIC_UPLOAD_URL || 'http://localhost:5000/uploads/images'

export default function DetailLaporan() {
  const { id } = useParams()
  const { user } = useAuth()
  const router = useRouter()

  const [laporan, setLaporan]   = useState(null)
  const [komentar, setKomentar] = useState([])
  const [loading, setLoading]   = useState(true)
  const [liked, setLiked]       = useState(false)
  const [saved, setSaved]       = useState(false)
  const [votes, setVotes]       = useState({})   // { id: 'up'|'dn'|null }
  const [replyTo, setReplyTo]   = useState(null)
  const [newComment, setNewComment] = useState('')
  const [newReply, setNewReply]     = useState('')
  const [sending, setSending]       = useState(false)
  const [expanded, setExpanded]     = useState({})

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

  const handleComment = async () => {
    if (!user) { toast.error('Login untuk berkomentar'); return }
    if (!newComment.trim()) return
    setSending(true)
    try {
      await komentarApi.create({ id_laporan: Number(id), isi_komentar: newComment })
      toast.success('Komentar dikirim')
      setNewComment('')
      const res = await komentarApi.getByLaporan(id)
      setKomentar(res.data.data || [])
    } catch {
      // demo mode
      setKomentar(k => [...k, {
        id: Date.now(), user: { username: user?.username || 'Anda' },
        isi_komentar: newComment, createdAt: new Date().toISOString(), balasKomentar: []
      }])
      setNewComment('')
    } finally { setSending(false) }
  }

  const handleReply = async (komentar_id) => {
    if (!user) { toast.error('Login untuk membalas'); return }
    if (!newReply.trim()) return
    setSending(true)
    try {
      await balasApi.create({ id_komentar: komentar_id, balas_komentar: newReply })
      toast.success('Balasan dikirim')
      setNewReply('')
      setReplyTo(null)
      load()
    } catch {
      toast.success('Balasan dikirim (demo)')
      setNewReply('')
      setReplyTo(null)
    } finally { setSending(false) }
  }

  const vote = (id, dir) => {
    if (!user) { toast.error('Login untuk vote'); return }
    setVotes(v => ({ ...v, [id]: v[id] === dir ? null : dir }))
  }

  const timeAgo = (date) => {
    try { return formatDistanceToNow(new Date(date), { addSuffix: true, locale: idLocale }) }
    catch { return '—' }
  }

  const progress = { pending: 10, menunggu: 10, diproses: 55, selesai: 100, ditolak: 0 }

  if (loading) return (
    <div className="min-h-screen bg-ink-50">
      <Navbar />
      <div className="flex items-center justify-center h-64"><Spinner size={24} /></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-ink-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-5 grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Main */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Back */}
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-xs text-ink-500 hover:text-ink-900 transition-colors w-fit">
            <ArrowLeft size={14} /> Kembali
          </button>

          {/* Laporan card */}
          <div className="bg-white rounded-2xl border border-ink-100/60 overflow-hidden">
            {/* Header */}
            <div className="flex items-start gap-3 p-4 pb-3">
              <Avatar name={laporan?.user?.username || 'U'} size="md" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-ink-900">{laporan?.user?.username || 'Pelapor'}</span>
                  <span className="text-[10px] bg-ink-50 text-ink-500 px-2 py-0.5 rounded-full border border-ink-100">User</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-ink-400">
                  <MapPin size={10} /> {laporan?.lokasi}
                  <span>·</span>
                  <Clock size={10} /> {timeAgo(laporan?.createdAt || laporan?.create_at)}
                </div>
              </div>
              <StatusBadge status={laporan?.status} />
            </div>

            {/* Image */}
            {laporan?.gambar ? (
              <div className="mx-4 mb-3 h-48 rounded-xl overflow-hidden bg-ink-100">
                <img src={`${UPLOAD_URL}/${laporan.gambar}`} alt={laporan.judul} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="mx-4 mb-3 h-32 rounded-xl bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center text-4xl border border-ink-100/40">
                🛣️
              </div>
            )}

            {/* Content */}
            <div className="px-4 pb-3">
              <div className="flex gap-1.5 mb-2">
                {laporan?.kategori && (
                  <span className="badge badge-diproses text-[10px]">
                    {laporan.kategori.nama_kategori || laporan.kategori.namaKategori}
                  </span>
                )}
              </div>
              <h1 className="text-base font-medium text-ink-900 mb-2 leading-snug">{laporan?.judul}</h1>
              <p className="text-sm text-ink-600 leading-relaxed">{laporan?.deskripsi}</p>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                {[
                  { label: 'Lokasi',    value: laporan?.lokasi },
                  { label: 'Kategori',  value: laporan?.kategori?.nama_kategori || laporan?.kategori?.namaKategori },
                  { label: 'Tanggal',   value: laporan?.createdAt ? new Date(laporan.createdAt).toLocaleDateString('id-ID') : '—' },
                  { label: 'ID Laporan', value: `#LPR-${id}` },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-ink-50 rounded-xl px-3 py-2">
                    <div className="text-[10px] text-ink-400">{label}</div>
                    <div className="text-xs font-medium text-ink-800 mt-0.5 truncate">{value || '—'}</div>
                  </div>
                ))}
              </div>

              {/* Progress */}
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-ink-500">Progress penanganan</span>
                  <span className="font-medium text-teal-700">{progress[laporan?.status] || 0}%</span>
                </div>
                <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-400 to-blue-500 rounded-full transition-all duration-700"
                    style={{ width: `${progress[laporan?.status] || 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-4 py-3 border-t border-ink-50 flex items-center gap-1">
              <button
                className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all',
                  liked ? 'bg-teal-50 text-teal-700' : 'text-ink-500 hover:bg-ink-50'
                )}
                onClick={() => { if (!user) { toast.error('Login untuk menyukai'); return } setLiked(v => !v) }}
              >
                <Heart size={14} className={liked ? 'fill-teal-500' : ''} />
                <span>{24 + (liked ? 1 : 0)}</span>
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-ink-500 hover:bg-ink-50 transition-all">
                <MessageCircle size={14} /> {komentar.length}
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-ink-500 hover:bg-ink-50 transition-all"
                onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success('Link disalin') }}>
                <Share2 size={14} />
              </button>
              <button
                className={clsx('ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all',
                  saved ? 'bg-blue-50 text-blue-700' : 'text-ink-500 hover:bg-ink-50'
                )}
                onClick={() => { if (!user) { toast.error('Login untuk menyimpan'); return } setSaved(v => !v); toast.success(!saved ? 'Disimpan' : 'Dihapus dari simpanan') }}
              >
                <Bookmark size={14} className={saved ? 'fill-blue-500' : ''} />
              </button>
              <button className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-600 px-2 py-1.5 rounded-lg hover:bg-rose-50 transition-all">
                <Flag size={13} />
              </button>
            </div>
          </div>

          {/* Comments section */}
          <div className="bg-white rounded-2xl border border-ink-100/60 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-ink-50">
              <span className="text-sm font-medium text-ink-900">
                Komentar <span className="text-ink-400 font-normal">({komentar.length})</span>
              </span>
              <select className="text-[11px] border border-ink-100 rounded-lg px-2 py-1 bg-transparent outline-none text-ink-500">
                <option>Terbaru</option>
                <option>Terpopuler</option>
              </select>
            </div>

            {/* Comment compose */}
            <div className="px-4 py-3 border-b border-ink-50 flex items-start gap-3">
              <Avatar name={user?.username || 'G'} size="sm" />
              <div className="flex-1">
                <textarea
                  className="w-full text-xs border border-ink-100 rounded-xl px-3 py-2 resize-none outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/10 transition-all bg-ink-50 focus:bg-white"
                  rows={2}
                  placeholder={user ? 'Tulis komentar...' : 'Login untuk berkomentar'}
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  disabled={!user}
                />
                <div className="flex justify-end mt-1.5">
                  <button
                    className="btn-primary text-xs py-1.5 px-3"
                    onClick={handleComment}
                    disabled={sending || !newComment.trim()}
                  >
                    {sending ? <Spinner size={12} className="text-white" /> : <Send size={12} />}
                    Kirim
                  </button>
                </div>
              </div>
            </div>

            {/* Comment list */}
            {komentar.length === 0 ? (
              <EmptyState icon={MessageCircle} title="Belum ada komentar" description="Jadilah yang pertama berkomentar" />
            ) : (
              <div className="divide-y divide-ink-50">
                {komentar.map((c, i) => (
                  <div key={c.id || i} className="px-4 py-3">
                    <div className="flex items-start gap-3">
                      <Avatar name={c.user?.username || 'U'} size="sm" color={i % 2 === 0 ? 'teal' : 'blue'} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-ink-900">{c.user?.username || 'Anonim'}</span>
                          <span className="text-[10px] text-ink-400">{timeAgo(c.createdAt)}</span>
                        </div>
                        <p className="text-xs text-ink-600 mt-1 leading-relaxed">{c.isi_komentar || c.isiKomentar}</p>

                        {/* Vote + Reply */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            className={clsx('flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg border transition-all',
                              votes[c.id] === 'up' ? 'bg-teal-50 text-teal-700 border-teal-200' : 'text-ink-400 border-ink-100 hover:border-teal-200 hover:text-teal-600'
                            )}
                            onClick={() => vote(c.id, 'up')}
                          >
                            <ThumbsUp size={11} className={votes[c.id] === 'up' ? 'fill-teal-500' : ''} />
                            <span>{(c._count?.likes || 7) + (votes[c.id] === 'up' ? 1 : 0)}</span>
                          </button>
                          <button
                            className={clsx('flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg border transition-all',
                              votes[c.id] === 'dn' ? 'bg-rose-50 text-rose-600 border-rose-200' : 'text-ink-400 border-ink-100 hover:border-rose-200 hover:text-rose-500'
                            )}
                            onClick={() => vote(c.id, 'dn')}
                          >
                            <ThumbsDown size={11} className={votes[c.id] === 'dn' ? 'fill-rose-500' : ''} />
                            <span>{votes[c.id] === 'dn' ? 1 : 0}</span>
                          </button>
                          <button
                            className="flex items-center gap-1 text-[11px] text-ink-400 hover:text-teal-600 px-2 py-1 rounded-lg hover:bg-teal-50 transition-all"
                            onClick={() => setReplyTo(replyTo === c.id ? null : c.id)}
                          >
                            <Reply size={11} /> Balas
                          </button>
                          {(c.balasKomentar?.length > 0) && (
                            <button
                              className="flex items-center gap-1 text-[11px] text-ink-400 hover:text-ink-700 ml-auto"
                              onClick={() => setExpanded(e => ({ ...e, [c.id]: !e[c.id] }))}
                            >
                              {expanded[c.id] ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                              {c.balasKomentar.length} balasan
                            </button>
                          )}
                        </div>

                        {/* Reply compose */}
                        {replyTo === c.id && (
                          <div className="mt-2 flex items-start gap-2">
                            <Avatar name={user?.username || 'G'} size="sm" />
                            <div className="flex-1">
                              <textarea
                                className="w-full text-xs border border-ink-100 rounded-xl px-3 py-2 resize-none outline-none focus:border-teal-400 transition-all bg-ink-50"
                                rows={2}
                                placeholder="Tulis balasan..."
                                value={newReply}
                                onChange={e => setNewReply(e.target.value)}
                                autoFocus
                              />
                              <div className="flex justify-end gap-1.5 mt-1">
                                <button className="btn-ghost text-xs py-1 px-2.5" onClick={() => setReplyTo(null)}>Batal</button>
                                <button className="btn-primary text-xs py-1 px-2.5" onClick={() => handleReply(c.id)} disabled={sending}>
                                  {sending ? <Spinner size={11} className="text-white" /> : <Send size={11} />} Kirim
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Replies */}
                        {expanded[c.id] && c.balasKomentar?.map((r, j) => (
                          <div key={r.id || j} className="mt-2 pl-4 border-l-2 border-teal-100">
                            <div className="flex items-start gap-2">
                              <Avatar name="Admin" size="sm" color="blue" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium text-ink-900">Admin</span>
                                  <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 rounded-full">Admin</span>
                                  <span className="text-[10px] text-ink-400">{timeAgo(r.createdAt)}</span>
                                </div>
                                <p className="text-xs text-ink-600 mt-1 leading-relaxed">{r.balas_komentar || r.balasKomentar}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          {/* Reporter info */}
          <div className="bg-white rounded-2xl border border-ink-100/60 p-4">
            <div className="text-xs font-medium text-ink-600 mb-3">Pelapor</div>
            <div className="flex items-center gap-3">
              <Avatar name={laporan?.user?.username || 'U'} size="md" />
              <div>
                <div className="text-sm font-medium text-ink-900">{laporan?.user?.username || '—'}</div>
                <div className="text-xs text-ink-400 mt-0.5">{laporan?.user?.email || '—'}</div>
              </div>
            </div>
          </div>

          {/* Status timeline */}
          <div className="bg-white rounded-2xl border border-ink-100/60 p-4">
            <div className="text-xs font-medium text-ink-600 mb-3">Riwayat status</div>
            <div className="flex flex-col gap-3">
              {[
                { label: 'Dilaporkan', desc: 'Pelapor', done: true },
                { label: 'Diterima',   desc: 'Sistem',  done: laporan?.status !== 'pending' && laporan?.status !== 'menunggu' },
                { label: 'Diproses',   desc: 'Admin',   done: laporan?.status === 'diproses' || laporan?.status === 'selesai' },
                { label: 'Selesai',    desc: 'Admin',   done: laporan?.status === 'selesai' },
              ].map(({ label, desc, done }, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={clsx('w-2 h-2 rounded-full shrink-0', done ? 'bg-teal-400' : 'bg-ink-200')} />
                  <div>
                    <div className={clsx('text-xs font-medium', done ? 'text-ink-900' : 'text-ink-400')}>{label}</div>
                    <div className="text-[10px] text-ink-400">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Share */}
          <div className="bg-white rounded-2xl border border-ink-100/60 p-4">
            <div className="text-xs font-medium text-ink-600 mb-3">Bagikan laporan</div>
            <button
              className="btn-ghost text-xs w-full justify-center"
              onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success('Link disalin!') }}
            >
              <Share2 size={13} /> Salin link
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const DEMO_LAPORAN = {
  id: 1, judul: 'Jalan berlubang besar di Jl. Sudirman No. 45 membahayakan pengendara',
  deskripsi: 'Terdapat lubang dengan diameter sekitar 50cm dan kedalaman 20cm yang sangat membahayakan pengendara motor maupun mobil, terutama saat malam hari. Kejadian ini sudah berlangsung selama 2 minggu dan telah menyebabkan beberapa kecelakaan kecil.',
  lokasi: 'Jl. Sudirman No. 45, Menteng', status: 'diproses',
  user: { username: 'Budi Santoso', email: 'budi@gmail.com' },
  kategori: { namaKategori: 'Infrastruktur Jalan' },
  createdAt: new Date(Date.now() - 7200000).toISOString(),
}
const DEMO_KOMENTAR = [
  { id: 1, user: { username: 'Siti Rahayu' }, isi_komentar: 'Setuju! Saya juga hampir kena waktu lewat sana kemarin malam. Semoga cepat diperbaiki.', createdAt: new Date(Date.now() - 3600000).toISOString(), balasKomentar: [{ id: 1, balas_komentar: 'Terima kasih. Laporan sudah diteruskan ke Dinas terkait.', createdAt: new Date(Date.now() - 1800000).toISOString() }] },
  { id: 2, user: { username: 'Ahmad Hidayat' }, isi_komentar: 'Sudah dilaporkan juga ke RT setempat tapi belum ada tindakan. Semoga dengan laporan di sini ada respon lebih cepat.', createdAt: new Date(Date.now() - 7200000).toISOString(), balasKomentar: [] },
  { id: 3, user: { username: 'Admin Dinas PU' }, isi_komentar: 'Laporan sudah diterima dan sedang dalam proses penjadwalan perbaikan. Target penyelesaian 3–5 hari kerja.', createdAt: new Date(Date.now() - 1800000).toISOString(), balasKomentar: [] },
]
