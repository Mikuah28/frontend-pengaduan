'use client'
// src/app/dashboard/profile/page.jsx
import { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useAuth } from '@/context/AuthContext'
import { laporanApi, profileApi, usersApi } from '@/lib/api'
import { StatusBadge, Avatar, Spinner, EmptyState } from '@/components/ui'
import {
    User, Mail, Heart, MessageCircle, Share2, Bookmark, MapPin, Clock,
    Filter, X, Flag, ChevronRight, Search,
    ChevronLeft, CheckCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import Cookies from 'js-cookie'
import Navbar from '@/components/layout/Navbar'
import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import clsx from 'clsx'

export default function userPage() {
    const { id } = useParams()
    const [loading, setLoading] = useState(true)
    const UPLOAD_URL = process.env.NEXT_PUBLIC_UPLOAD_URL || 'http://localhost:5000/uploads/images'
    const [user, setUser] = useState({})
    const [laporan, setLaporan] = useState([])
    const [meta, setMeta] = useState({ total: 0 })
    const [filter, setFilter] = useState({ status: '', kategori_id: '', page: 1 })

    const [imagePreview, setImagePreview] = useState(null)

    const router = useRouter();

    useEffect(() => {
        loadProfile()
        loadLaporan()
    }, [])

    async function loadProfile() {
        try {
            const res = await profileApi.getUser(id)
            setUser(res.data.data || {})
        } catch { setUser({}) }
    }

    async function loadLaporan(isRefresh = true) {
        if (isRefresh) {
            setLoading(true)
        }
        try {
            const res = await laporanApi.getLaporanByUser(id, { ...filter, limit: 10 })
            setLaporan(res.data.data || [])
            setMeta(res.data.meta || { total: 0 })
        } catch {
            setLaporan(DEMO_LAPORAN)
            setMeta({ total: DEMO_LAPORAN.length })
        } finally {
            setLoading(false)
        }
    }

    const initials = (user?.username || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    const roleLabel = { super_admin: 'Super Admin', admin: 'Admin', user: 'User' }[user?.role] || 'User'
    const roleColor = { super_admin: 'from-purple-500 to-blue-600', admin: 'from-teal-400 to-blue-600', user: 'from-teal-400 to-teal-600' }[user?.role] || 'from-teal-400 to-blue-600'

    const filtered = laporan

    const timeAgo = (date) => {
        try { return formatDistanceToNow(new Date(date), { addSuffix: true, locale: idLocale }) }
        catch { return '—' }
    }

    const EMOJI = { 'Infrastruktur': '🛣️', 'Kebersihan': '🗑️', 'Keamanan': '🛡️', 'Pelayanan': '🏛️', 'Listrik': '⚡', 'Air': '💧' }
    const getEmoji = (name = '') => {
        const key = Object.keys(EMOJI).find(k => name.includes(k))
        return EMOJI[key] || '📋'
    }

    async function handleLike(id) {
        const res = await likeApi.toggleLike(id)
        if (res.data.ok) {
            loadLaporan(false)
        }
    }

    return (
        <div className="min-h-screen bg-ink-50">
            <Navbar />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 p-10">
                {/* Profile card */}
                <div className="xl:col-span-1">
                    <div className="card flex flex-col items-center text-center">
                        {/* Avatar dengan fitur klik untuk ubah */}
                        <div className="relative group cursor-pointer mb-4">
                            <label htmlFor="avatar-input" className="cursor-pointer block relative rounded-2xl overflow-hidden">
                                {imagePreview ? (
                                    <img className='w-20 h-20 rounded-2xl object-cover' src={imagePreview} alt="Preview" />
                                ) : user?.foto_profil ? (
                                    <img className='w-20 h-20 rounded-2xl object-cover' src={`${UPLOAD_URL}/${user?.foto_profil}`} alt="Avatar" />
                                ) : (
                                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${roleColor} flex items-center justify-center text-white text-2xl font-bold font-display`}>
                                        {initials}
                                    </div>
                                )}
                            </label>
                        </div>

                        <div className="text-base font-medium text-ink-900">{user?.username || '—'}</div>
                        <div className="text-xs text-ink-500 mt-0.5">{user?.email || '—'}</div>
                        <div className={`mt-2 text-xs font-medium px-3 py-1 rounded-full ${user?.role === 'super_admin' ? 'bg-purple-100 text-purple-700' :
                            user?.role === 'admin' ? 'bg-blue-50 text-blue-700' : 'bg-teal-50 text-teal-700'
                            }`}>{roleLabel}</div>

                        <div className="w-full mt-5 pt-5 border-t border-ink-100 grid grid-cols-3 gap-2">
                            {[
                                { label: 'Laporan', value: user?.stats?.total_laporan },
                                { label: 'Selesai', value: user?.stats?.laporan_selesai },
                                { label: 'Komentar', value: user?.stats?.total_komentar },
                            ].map(({ label, value }) => (
                                <div key={label} className="bg-ink-50 rounded-xl py-2 px-1">
                                    <div className="text-sm font-bold text-ink-900">{value}</div>
                                    <div className="text-[10px] text-ink-400 mt-0.5">{label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Info box */}
                    <div className="card mt-4">
                        <div className="text-xs font-medium text-ink-600 mb-3">Informasi akun</div>
                        <div className="flex flex-col gap-2.5">
                            <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                                    <User size={13} className="text-teal-600" />
                                </div>
                                <div>
                                    <div className="text-[10px] text-ink-400">Nama</div>
                                    <div className="text-xs text-ink-800">{user?.username || '—'}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                                    <Mail size={13} className="text-blue-600" />
                                </div>
                                <div>
                                    <div className="text-[10px] text-ink-400">Email</div>
                                    <div className="text-xs text-ink-800">{user?.email || '—'}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                                    <CheckCircle size={13} className="text-purple-600" />
                                </div>
                                <div>
                                    <div className="text-[10px] text-ink-400">Role</div>
                                    <div className="text-xs text-ink-800">{roleLabel}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
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
                    <div className='w-full grid grid-cols-1 md:grid-cols-2 gap-3'>                    {/* Post list */}
                        {loading ? (
                            <div className="flex justify-center py-16"><Spinner size={22} /></div>
                        ) : filtered.length === 0 ? (
                            <EmptyState icon={Flag} title="Tidak ada laporan" description="Belum ada laporan yang sesuai filter" />
                        ) : (
                            filtered.map((l, i) => (
                                <article key={l.id || i} className="bg-white rounded-2xl border border-ink-100/60 overflow-hidden hover:border-ink-200 transition-all">
                                    {/* Post header */}
                                    <div className="flex items-start gap-3 p-4 pb-3">
                                        {l.user?.foto_profil ?
                                            (
                                                <img src={`${UPLOAD_URL}/${l.user?.foto_profil}`} alt={user?.user} className="size-9 rounded-full object-cover" />
                                            ) :
                                            (
                                                <Avatar name={l.user?.username || 'U'} size="md" color={i % 2 === 0 ? 'teal' : 'blue'} />
                                            )
                                        }
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
                                        <div className="mx-4 mb-3 h-96 object-cover rounded-xl overflow-hidden bg-ink-100">
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
                                                l?.is_liked ? 'bg-teal-50 text-teal-700' : 'text-ink-500 hover:bg-ink-50'
                                            )}
                                            onClick={() => handleLike(l.id)}
                                        >
                                            <Heart size={14} className={l?.is_liked ? 'fill-teal-500' : ''} />
                                            <span>{l._count?.likes}</span>
                                        </button>
                                        <Link href={`/laporan/${l.id}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-ink-500 hover:bg-ink-50 transition-all">
                                            <MessageCircle size={14} />
                                            <span>{l._count?.komentar || 0}</span>
                                        </Link>
                                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-ink-500 hover:bg-ink-50 transition-all">
                                            <Share2 size={14} />
                                        </button>
                                        {/* <button
                    className={clsx('ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all',
                      saved[l.id] ? 'bg-blue-50 text-blue-700' : 'text-ink-500 hover:bg-ink-50'
                    )}
                    onClick={() => toggleSave(l.id)}
                  >
                    <Bookmark size={14} className={saved[l.id] ? 'fill-blue-500' : ''} />
                  </button> */}
                                        <Link href={`/laporan/${l.id}`} className="flex items-center gap-1 text-xs text-teal-600 hover:underline pl-1 ml-auto">
                                            Lihat <ChevronRight size={12} />
                                        </Link>
                                    </div>
                                </article>
                            ))
                        )}
                    </div>


                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-4 p-3 card">
                        <span className="text-xs text-ink-400">Halaman {filter.page} dari {meta.totalPages}</span>
                        <div className="flex items-center gap-1">
                            <button
                                disabled={filter.page === 1}
                                className={`w-7 h-7 rounded-lg text-xs transition-all flex justify-center items-center ${filter.page === meta.page ? 'bg-teal-400 text-white' : 'hover:bg-ink-50 text-ink-600'}`}
                                onClick={() => setFilter(f => ({ ...f, page: meta.page - 1 }))}
                            >
                                <ChevronLeft />
                            </button>
                            <div className={`w-7 h-7 rounded-lg text-xs transition-all flex justify-center items-center text-ink-600`}>
                                {meta.page}
                            </div>
                            <button
                                disabled={filter.page === meta.totalPages}
                                className={`w-7 h-7 rounded-lg text-xs transition-all flex justify-center items-center ${filter.page === meta.page ? 'bg-teal-400 text-white' : 'hover:bg-ink-50 text-ink-600'}`}
                                onClick={() => setFilter(f => ({ ...f, page: meta.page + 1 }))}
                            >
                                <ChevronRight />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
