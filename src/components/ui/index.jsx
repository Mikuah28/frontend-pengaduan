'use client'
// src/components/ui/index.jsx
import { Loader2, X } from 'lucide-react'
import clsx from 'clsx'

// ── Loading Spinner ───────────────────────────────────────────────────────────
export function Spinner({ size = 16, className }) {
  return <Loader2 size={size} className={clsx('animate-spin text-teal-400', className)} />
}

// ── Status Badge ──────────────────────────────────────────────────────────────
const statusMap = {
  pending:   'badge-pending',
  menunggu:  'badge-pending',
  diproses:  'badge-diproses',
  selesai:   'badge-selesai',
  ditolak:   'badge-ditolak',
}
const statusLabel = {
  pending:  'Menunggu',
  menunggu: 'Menunggu',
  diproses: 'Diproses',
  selesai:  'Selesai',
  ditolak:  'Ditolak',
}
export function StatusBadge({ status }) {
  return (
    <span className={clsx('badge', statusMap[status] || 'badge-user')}>
      {statusLabel[status] || status}
    </span>
  )
}

// ── Role Badge ────────────────────────────────────────────────────────────────
export function RoleBadge({ role }) {
  const map = {
    super_admin: ['badge-super', 'Super Admin'],
    admin: ['badge-admin', 'Admin'],
    user: ['badge-user', 'User'],
  }
  const [cls, label] = map[role] || ['badge-user', role]
  return <span className={clsx('badge', cls)}>{label}</span>
}

// ── Avatar ────────────────────────────────────────────────────────────────────
export function Avatar({ name, size = 'md', color = 'teal' }) {
  const initials = name
    ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U'
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base' }
  const colors = {
    teal: 'bg-teal-50 text-teal-800',
    blue: 'bg-blue-50 text-blue-800',
    amber: 'bg-amber-50 text-amber-600',
  }
  return (
    <div className={clsx('rounded-full flex items-center justify-center font-medium', sizes[size], colors[color] || colors.teal)}>
      {initials}
    </div>
  )
}

// ── Empty State ───────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-ink-50 flex items-center justify-center mb-4">
          <Icon size={24} className="text-ink-400" />
        </div>
      )}
      <div className="text-sm font-medium text-ink-700 mb-1">{title}</div>
      {description && <div className="text-xs text-ink-400 mb-4 max-w-xs">{description}</div>}
      {action}
    </div>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl border border-ink-100/60 w-full max-w-md shadow-lg animate-fade-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-100/60">
          <h3 className="text-sm font-medium text-ink-900">{title}</h3>
          <button onClick={onClose} className="btn-icon hover:bg-ink-50 text-ink-400">
            <X size={16} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && (
          <div className="px-5 py-4 border-t border-ink-100/60 flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Confirm Dialog ────────────────────────────────────────────────────────────
export function ConfirmDialog({ open, onClose, onConfirm, title, description, loading }) {
  return (
    <Modal open={open} onClose={onClose} title={title}
      footer={<>
        <button className="btn-ghost" onClick={onClose}>Batal</button>
        <button className="btn-danger" onClick={onConfirm} disabled={loading}>
          {loading && <Spinner size={14} />}Hapus
        </button>
      </>}
    >
      <p className="text-sm text-ink-600">{description}</p>
    </Modal>
  )
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
export function StatCard({ icon: Icon, label, value, change, changeType = 'up', iconBg = 'bg-teal-50', iconColor = 'text-teal-600' }) {
  return (
    <div className="metric-card">
      <div className={clsx('metric-icon', iconBg)}>
        <Icon size={18} className={iconColor} />
      </div>
      <div>
        <div className="text-2xl font-display font-bold text-ink-900 leading-none">{value}</div>
        <div className="text-xs text-ink-500 mt-1">{label}</div>
      </div>
      {change && (
        <div className={clsx('text-xs flex items-center gap-1', changeType === 'up' ? 'text-teal-600' : 'text-rose-500')}>
          {changeType === 'up' ? '↑' : '↓'} {change}
        </div>
      )}
    </div>
  )
}

// ── Page Header ───────────────────────────────────────────────────────────────
export function PageHeader({ title, description, action }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h2 className="text-lg font-display font-bold text-ink-900">{title}</h2>
        {description && <p className="text-xs text-ink-500 mt-0.5">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

// ── Pagination ────────────────────────────────────────────────────────────────
export function Pagination({ currentPage, totalPages, onPageChange, className = '' }) {
  if (!totalPages || totalPages <= 1) return null

  const buildPages = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const pages = [1]
    if (currentPage > 3) pages.push('...')
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i)
    }
    if (currentPage < totalPages - 2) pages.push('...')
    pages.push(totalPages)
    return pages
  }

  return (
    <div className={clsx('flex items-center justify-between mt-4 pt-3 border-t border-ink-50', className)}>
      <span className="text-xs text-ink-400">
        Halaman <span className="font-medium text-ink-700">{currentPage}</span> dari {totalPages}
      </span>
      <div className="flex items-center gap-1">
        <button
          className="w-7 h-7 rounded-lg text-xs transition-all disabled:opacity-30 hover:bg-ink-50 text-ink-600 disabled:cursor-not-allowed"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >‹</button>
        {buildPages().map((p, i) =>
          p === '...' ? (
            <span key={`el-${i}`} className="w-7 h-7 flex items-center justify-center text-xs text-ink-400">…</span>
          ) : (
            <button
              key={p}
              className={clsx(
                'w-7 h-7 rounded-lg text-xs font-medium transition-all',
                currentPage === p
                  ? 'bg-teal-400 text-white shadow-sm'
                  : 'hover:bg-ink-50 text-ink-600'
              )}
              onClick={() => onPageChange(p)}
            >{p}</button>
          )
        )}
        <button
          className="w-7 h-7 rounded-lg text-xs transition-all disabled:opacity-30 hover:bg-ink-50 text-ink-600 disabled:cursor-not-allowed"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >›</button>
      </div>
    </div>
  )
}
