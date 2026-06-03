'use client'
// src/app/page.jsx
import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import { StatusBadge, Avatar, Spinner, EmptyState } from '@/components/ui'
import { laporanApi, kategoriApi, komentarApi } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import {
  Heart, MessageCircle, Share2, Bookmark, MapPin, Clock,
  TrendingUp, Plus, Filter, X, Flag, ChevronRight, Search
} from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const UPLOAD_URL = process.env.NEXT_PUBLIC_UPLOAD_URL || 'http://localhost:5000/uploads/images'

export default function HomePage() {
  const { user } = useAuth()
  const [laporan, setLaporan]   = useState([])
  const [kategori, setKategori] = useState([])
  const [loading, setLoading]   = useState(true)
  const [liked, setLiked]       = useState({})
  const [saved, setSaved]       = useState({})
  const [filter, setFilter]     = useState({ status: '', kategori_id: '' })
  const [search, setSearch]     = useState('')
  const [meta, setMeta]         = useState({ total: 0 })

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
      setMeta(res.data.meta || { total: 0 })
    } catch {
      setLaporan(DEMO_LAPORAN)
      setMeta({ total: DEMO_LAPORAN.length })
    } finally {
      setLoading(false)
    }
  }

  const toggleLike = (id) => {
    if (!user) { toast.error('Login untuk menyukai laporan'); return }
    setLiked(l => ({ ...l, [id]: !l[id] }))
  }
  const toggleSave = (id) => {
    if (!user) { toast.error('Login untuk menyimpan laporan'); return }
    setSaved(s => ({ ...s, [id]: !s[id] }))
    toast.success(saved[id] ? 'Dihapus dari simpanan' : 'Disimpan')
  }

  const filtered = laporan.filter(l =>
    !search ||
    l.judul?.toLowerCase().includes(search.toLowerCase()) ||
    l.lokasi?.toLowerCase().includes(search.toLowerCase())
  )

  const timeAgo = (date) => {
    try { return formatDistanceToNow(new Date(date), { addSuffix: true, locale: idLocale }) }
    catch { return '—' }
  }

  const EMOJI = { 'Infrastruktur': '🛣️', 'Kebersihan': '🗑️', 'Keamanan': '🛡️', 'Pelayanan': '🏛️', 'Listrik': '⚡', 'Air': '💧' }
  const getEmoji = (name = '') => {
    const key = Object.keys(EMOJI).find(k => name.includes(k))
    return EMOJI[key] || '📋'
  }

  return (
    <div className="min-h-screen bg-ink-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-ink-900 px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-xs text-teal-300 font-medium">Platform Pengaduan Resmi</span>
          </div>
          <h1 className="font-display font-bold text-3xl text-white mb-2 leading-tight">
            Suara Anda,<br />
            <span className="text-teal-400">Perubahan Nyata</span>
          </h1>
          <p className="text-sm text-white/50 mb-5 max-w-md">
            Laporkan masalah di sekitar Anda. Setiap laporan ditangani dengan serius.
          </p>

          {/* Search */}
          <div className="flex gap-2 max-w-xl">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                className="w-full bg-white/10 border border-white/15 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-white/40 outline-none focus:border-teal-400 focus:bg-white/15 transition-all"
                placeholder="Cari laporan atau lokasi..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Link href={user ? '/laporan/buat' : '/login'} className="btn-primary shrink-0">
              <Plus size={15} /> Lapor
            </Link>
          </div>

          {/* Quick stats */}
          <div className="flex items-center gap-5 mt-5 pt-5 border-t border-white/8">
            {[
              { label: 'Total laporan', value: meta.total || '1.248' },
              { label: 'Selesai', value: '94%' },
              { label: 'Respons', value: '3 hari' },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="font-display font-bold text-xl text-white">{value}</div>
                <div className="text-xs text-white/40 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-4 py-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Feed */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Filter bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={13} className="text-ink-400" />
            {['', 'pending', 'diproses', 'selesai'].map(s => (
              <button
                key={s}
                className={clsx('px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
                  filter.status === s
                    ? 'bg-teal-400 text-white border-teal-400'
                    : 'bg-white text-ink-600 border-ink-100 hover:border-teal-300'
                )}
                onClick={() => setFilter(f => ({ ...f, status: s }))}
              >
                {s === '' ? 'Semua' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
            {(filter.status || filter.kategori_id) && (
              <button className="text-xs text-rose-500 flex items-center gap-1 ml-1" onClick={() => setFilter({ status: '', kategori_id: '' })}>
                <X size={11} /> Reset
              </button>
            )}
          </div>

          {/* Compose box */}
          {user && (
            <Link href="/laporan/buat" className="bg-white rounded-2xl border border-ink-100/60 p-4 flex items-center gap-3 hover:border-teal-300 transition-all group">
              <Avatar name={user.username} size="sm" />
              <div className="flex-1 bg-ink-50 rounded-xl px-4 py-2.5 text-xs text-ink-400 group-hover:bg-teal-50 group-hover:text-teal-600 transition-all">
                Laporkan masalah di sekitar Anda...
              </div>
              <div className="w-8 h-8 rounded-xl bg-teal-400 flex items-center justify-center">
                <Plus size={15} className="text-white" />
              </div>
            </Link>
          )}

          {/* Post list */}
          {loading ? (
            <div className="flex justify-center py-16"><Spinner size={22} /></div>
          ) : filtered.length === 0 ? (
            <EmptyState icon={Flag} title="Tidak ada laporan" description="Belum ada laporan yang sesuai filter" />
          ) : (
            filtered.map((l, i) => (
              <article key={l.id || i} className="bg-white rounded-2xl border border-ink-100/60 overflow-hidden hover:border-ink-200 transition-all">
                {/* Post header */}
                <div className="flex items-start gap-3 p-4 pb-3">
                  <Avatar name={l.user?.username || 'U'} size="md" color={i % 2 === 0 ? 'teal' : 'blue'} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-ink-900">{l.user?.username || 'Pelapor'}</span>
                      <span className="text-[10px] bg-ink-50 text-ink-500 px-2 py-0.5 rounded-full border border-ink-100">User</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-ink-400">
                      <MapPin size={10} />
                      <span>{l.lokasi}</span>
                      <span>·</span>
                      <Clock size={10} />
                      <span>{timeAgo(l.createdAt || l.create_at)}</span>
                    </div>
                  </div>
                  <StatusBadge status={l.status} />
                </div>

                {/* Image */}
                {l.gambar && (
                  <div className="mx-4 mb-3 min-h-36 rounded-xl overflow-hidden bg-ink-100">
                    <img src={`${UPLOAD_URL}/${l.gambar}`} alt={l.judul} className="w-full h-full object-cover" />
                  </div>
                )}
                {!l.gambar && (
                  <div className="mx-4 mb-3 h-24 rounded-xl bg-gradient-to-br from-ink-50 to-ink-100 flex items-center justify-center text-3xl">
                    {getEmoji(l.kategori?.nama_kategori || l.kategori?.namaKategori)}
                  </div>
                )}

                {/* Content */}
                <div className="px-4 pb-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    {l.kategori && (
                      <span className="badge badge-diproses text-[10px]">
                        {l.kategori.nama_kategori || l.kategori.namaKategori}
                      </span>
                    )}
                  </div>
                  <Link href={`/laporan/${l.id}`}>
                    <h2 className="text-sm font-medium text-ink-900 mb-1.5 hover:text-teal-700 transition-colors leading-snug">
                      {l.judul}
                    </h2>
                  </Link>
                  <p className="text-xs text-ink-500 leading-relaxed line-clamp-2">{l.deskripsi}</p>
                </div>

                {/* Actions */}
                <div className="px-4 py-3 border-t border-ink-50 flex items-center gap-1">
                  <button
                    className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all',
                      liked[l.id] ? 'bg-teal-50 text-teal-700' : 'text-ink-500 hover:bg-ink-50'
                    )}
                    onClick={() => toggleLike(l.id)}
                  >
                    <Heart size={14} className={liked[l.id] ? 'fill-teal-500' : ''} />
                    <span>{(l._count?.komentar || 0) + (liked[l.id] ? 1 : 0)}</span>
                  </button>
                  <Link href={`/laporan/${l.id}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-ink-500 hover:bg-ink-50 transition-all">
                    <MessageCircle size={14} />
                    <span>{l._count?.komentar || 0}</span>
                  </Link>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-ink-500 hover:bg-ink-50 transition-all">
                    <Share2 size={14} />
                  </button>
                  <button
                    className={clsx('ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all',
                      saved[l.id] ? 'bg-blue-50 text-blue-700' : 'text-ink-500 hover:bg-ink-50'
                    )}
                    onClick={() => toggleSave(l.id)}
                  >
                    <Bookmark size={14} className={saved[l.id] ? 'fill-blue-500' : ''} />
                  </button>
                  <Link href={`/laporan/${l.id}`} className="flex items-center gap-1 text-xs text-teal-600 hover:underline pl-1">
                    Lihat <ChevronRight size={12} />
                  </Link>
                </div>
              </article>
            ))
          )}
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-4">
          {/* Categories */}
          <div className="bg-white rounded-2xl border border-ink-100/60 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-ink-700">Kategori</span>
            </div>
            <div className="flex flex-col gap-1">
              {kategori.map((k, i) => (
                <button
                  key={k.id || i}
                  onClick={() => setFilter(f => ({ ...f, kategori_id: filter.kategori_id == k.id ? '' : k.id }))}
                  className={clsx('flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs transition-all',
                    filter.kategori_id == k.id ? 'bg-teal-50 text-teal-800 font-medium' : 'text-ink-600 hover:bg-ink-50'
                  )}
                >
                  <span className="text-sm">{getEmoji(k.nama_kategori || k.namaKategori)}</span>
                  <span className="flex-1 text-left">{k.nama_kategori || k.namaKategori}</span>
                  <span className="text-[10px] text-ink-400">{Math.floor(Math.random() * 80) + 10}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Trending */}
          <div className="bg-white rounded-2xl border border-ink-100/60 p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={13} className="text-teal-500" />
              <span className="text-xs font-medium text-ink-700">Trending hari ini</span>
            </div>
            <div className="flex flex-col gap-0">
              {TRENDING.map((t, i) => (
                <div key={i} className="flex items-start gap-3 py-2.5 border-b border-ink-50 last:border-0">
                  <span className="text-sm font-display font-bold text-ink-200 w-4 shrink-0">{i + 1}</span>
                  <div>
                    <div className="text-[10px] text-ink-400">{t.kat}</div>
                    <div className="text-xs font-medium text-ink-800 mt-0.5">{t.tag}</div>
                    <div className="text-[10px] text-ink-400 mt-0.5">{t.count} laporan</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          {!user && (
            <div className="bg-ink-900 rounded-2xl p-4">
              <div className="font-display font-bold text-base text-white mb-1.5">Bergabung sekarang</div>
              <p className="text-xs text-white/50 mb-3">Daftar dan buat laporan pertama Anda</p>
              <Link href="/register" className="btn-primary text-xs w-full justify-center py-2">
                Daftar gratis
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const TRENDING = [
  { tag: '#JalanRusak',       kat: 'Infrastruktur · Trending', count: 412 },
  { tag: '#SampahMenumpuk',   kat: 'Kebersihan',               count: 287 },
  { tag: '#BanjirJakarta',    kat: 'Bencana Alam',             count: 198 },
]
const DEMO_KAT = [
  { id: 1, namaKategori: 'Infrastruktur Jalan' },
  { id: 2, namaKategori: 'Kebersihan & Sampah' },
  { id: 3, namaKategori: 'Keamanan' },
  { id: 4, namaKategori: 'Pelayanan Publik' },
  { id: 5, namaKategori: 'Listrik & Air' },
]
const DEMO_LAPORAN = [
  { id: 1, judul: 'Jalan berlubang Jl. Sudirman No. 45 membahayakan pengendara', deskripsi: 'Terdapat lubang besar yang sangat membahayakan pengendara motor maupun mobil saat malam hari.', lokasi: 'Kec. Menteng', status: 'diproses', user: { username: 'Budi Santoso' }, kategori: { namaKategori: 'Infrastruktur Jalan' }, createdAt: new Date(Date.now() - 7200000).toISOString(), _count: { komentar: 8 } },
  { id: 2, judul: '12 titik lampu PJU mati di Jl. Gatot Subroto sudah 3 minggu', deskripsi: 'Lampu penerangan jalan umum sudah mati lama, menyebabkan area rawan kejahatan di malam hari.', lokasi: 'Kec. Senen', status: 'pending', user: { username: 'Siti Rahayu' }, kategori: { namaKategori: 'Keamanan' }, createdAt: new Date(Date.now() - 14400000).toISOString(), _count: { komentar: 15 } },
  { id: 3, judul: 'Sampah menumpuk di Blok B Perumahan Griya Asri 5 hari tidak diangkut', deskripsi: 'Sampah meluber ke badan jalan, menimbulkan bau tidak sedap dan berpotensi menimbulkan penyakit.', lokasi: 'Kec. Gambir', status: 'selesai', user: { username: 'Ahmad Hidayat' }, kategori: { namaKategori: 'Kebersihan & Sampah' }, createdAt: new Date(Date.now() - 86400000).toISOString(), _count: { komentar: 5 } },
  { id: 4, judul: 'Drainase tersumbat menyebabkan genangan air saat hujan di RW 05', deskripsi: 'Saluran drainase tersumbat sampah sehingga air meluap ke jalan setinggi 30cm saat hujan deras.', lokasi: 'Kec. Tanah Abang', status: 'diproses', user: { username: 'Nina Wati' }, kategori: { namaKategori: 'Infrastruktur Jalan' }, createdAt: new Date(Date.now() - 172800000).toISOString(), _count: { komentar: 3 } },
]
