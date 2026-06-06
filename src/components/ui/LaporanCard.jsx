'use client'
// src/components/ui/LaporanCard.jsx
import { StatusBadge, Avatar } from '@/components/ui'
import { Heart, MessageCircle, Share2, Bookmark, MapPin, Clock, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import clsx from 'clsx'

const UPLOAD_URL = process.env.NEXT_PUBLIC_UPLOAD_URL || 'http://localhost:5000/uploads/images'

const EMOJI_MAP = {
  'Infrastruktur': '🛣️',
  'Kebersihan': '🗑️',
  'Keamanan': '🛡️',
  'Pelayanan': '🏛️',
  'Listrik': '⚡',
  'Air': '💧',
}

function getEmoji(name = '') {
  const key = Object.keys(EMOJI_MAP).find(k => name.includes(k))
  return EMOJI_MAP[key] || '📋'
}

function timeAgo(date) {
  try { return formatDistanceToNow(new Date(date), { addSuffix: true, locale: idLocale }) }
  catch { return '—' }
}

/**
 * Shared laporan card used on /app/page.jsx and /app/laporanku/page.jsx
 *
 * Props:
 *  - laporan   : the laporan object
 *  - index     : row index (for avatar colour alternation)
 *  - saved     : boolean – is this card saved by the current user?
 *  - onLike    : (id) => void
 *  - onSave    : (id) => void
 */
export default function LaporanCard({ laporan: l, index: i = 0, saved = false, onLike, onSave }) {
  const avatarColor = i % 2 === 0 ? 'teal' : 'blue'

  return (
    <article className="bg-white rounded-2xl border border-ink-100/60 overflow-hidden hover:border-ink-200 transition-all">
      {/* Header */}
      <div className="flex items-start gap-3 p-4 pb-3">
        {l.user?.foto_profil
          ? <img
              src={`${UPLOAD_URL}/${l.user.foto_profil}`}
              alt={l.user.username}
              className="size-9 rounded-full object-cover shrink-0"
            />
          : <Avatar name={l.user?.username || 'U'} size="md" color={avatarColor} />
        }
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-ink-900">{l.user?.username || 'Pelapor'}</span>
            <span className="text-[10px] bg-ink-50 text-ink-500 px-2 py-0.5 rounded-full border border-ink-100">
              User
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-ink-400">
            <MapPin size={10} />
            <span className="truncate max-w-[180px]">{l.lokasi}</span>
            <span>·</span>
            <Clock size={10} />
            <span>{timeAgo(l.createdAt || l.created_at)}</span>
          </div>
        </div>
        <StatusBadge status={l.status} />
      </div>

      {/* Image / emoji placeholder */}
      {l.gambar ? (
        <div className="mx-4 mb-3 min-h-36 rounded-xl overflow-hidden bg-ink-100">
          <img src={`${UPLOAD_URL}/${l.gambar}`} alt={l.judul} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="mx-4 mb-3 h-24 rounded-xl bg-gradient-to-br from-ink-50 to-ink-100 flex items-center justify-center text-3xl">
          {getEmoji(l.kategori?.nama_kategori || l.kategori?.namaKategori || '')}
        </div>
      )}

      {/* Content */}
      <div className="px-4 pb-3">
        {l.kategori && (
          <div className="flex items-center gap-1.5 mb-2">
            <span className="badge badge-diproses text-[10px]">
              {l.kategori.nama_kategori || l.kategori.namaKategori}
            </span>
          </div>
        )}
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
          className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all',
            l.is_liked ? 'bg-teal-50 text-teal-700' : 'text-ink-500 hover:bg-ink-50'
          )}
          onClick={() => onLike?.(l.id)}
        >
          <Heart size={14} className={l.is_liked ? 'fill-teal-500' : ''} />
          <span>{l._count?.likes ?? 0}</span>
        </button>

        <Link
          href={`/laporan/${l.id}`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-ink-500 hover:bg-ink-50 transition-all"
        >
          <MessageCircle size={14} />
          <span>{l._count?.komentar ?? 0}</span>
        </Link>

        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-ink-500 hover:bg-ink-50 transition-all">
          <Share2 size={14} />
        </button>

        <button
          className={clsx(
            'ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all',
            saved ? 'bg-blue-50 text-blue-700' : 'text-ink-500 hover:bg-ink-50'
          )}
          onClick={() => onSave?.(l.id)}
        >
          <Bookmark size={14} className={saved ? 'fill-blue-500' : ''} />
        </button>

        <Link
          href={`/laporan/${l.id}`}
          className="flex items-center gap-1 text-xs text-teal-600 hover:underline pl-1"
        >
          Lihat <ChevronRight size={12} />
        </Link>
      </div>
    </article>
  )
}
