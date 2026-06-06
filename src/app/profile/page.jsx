'use client'
// src/app/dashboard/profile/page.jsx
import { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useAuth } from '@/context/AuthContext'
import { profileApi, usersApi } from '@/lib/api'
import { Spinner, PageHeader } from '@/components/ui'
import { User, Mail, Lock, Eye, EyeOff, Save, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import Cookies from 'js-cookie'
import Navbar from '@/components/layout/Navbar'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
    const UPLOAD_URL = process.env.NEXT_PUBLIC_UPLOAD_URL || 'http://localhost:5000/uploads/images'
    const { user } = useAuth()
    const [tab, setTab] = useState('info')
    const [saving, setSaving] = useState(false)

    const [infoForm, setInfoForm] = useState({ username: '', email: '' })
    const [imageFile, setImageFile] = useState(null) // Tambahan state untuk menyimpan file gambar baru
    const [imagePreview, setImagePreview] = useState(null)
    const [pwForm, setPwForm] = useState({ password: '', confirm: '' })
    const [showPw, setShowPw] = useState(false)

    const router = useRouter()
    useEffect(() => {
        if (user?.role !== 'user') {
            router.push('/dashboard')
        }
    }, [router])

    useEffect(() => {
        if (user) {
            setInfoForm({
                username: user.username || '',
                email: user.email || '',
            })
        }
    }, [user])

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setImageFile(file)
            setImagePreview(URL.createObjectURL(file))
        }
    }

    const handleSaveInfo = async () => {
        setSaving(true)
        try {
            const formData = new FormData()
            formData.append('username', infoForm.username)
            formData.append('email', infoForm.email)

            if (imageFile) {
                formData.append('image', imageFile)
            }
            await profileApi.update(formData)

            toast.success('Profil berhasil diperbarui')
            window.location.reload()
        } catch (e) {
            toast.error(e.response?.data?.message || 'Gagal menyimpan')
        } finally {
            setSaving(false)
        }
    }

    const handleSavePw = async () => {
        if (pwForm.password !== pwForm.confirm) { toast.error('Password tidak cocok'); return }
        if (pwForm.password.length < 6) { toast.error('Password minimal 6 karakter'); return }
        setSaving(true)
        try {
            await usersApi.update(user?.id, { password: pwForm.password })
            toast.success('Password berhasil diubah')
            setPwForm({ password: '', confirm: '' })
        } catch (e) {
            toast.error(e.response?.data?.message || 'Gagal mengubah password')
        } finally { setSaving(false) }
    }

    const initials = (user?.username || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    const roleLabel = { super_admin: 'Super Admin', admin: 'Admin', user: 'User' }[user?.role] || 'User'
    const roleColor = { super_admin: 'from-purple-500 to-blue-600', admin: 'from-teal-400 to-blue-600', user: 'from-teal-400 to-teal-600' }[user?.role] || 'from-teal-400 to-blue-600'

    return (
        <div className="min-h-screen bg-ink-50">
            <Navbar />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 p-10">
                {/* Profile card */}
                <div className="xl:col-span-1">
                    <div className="card flex flex-col items-center text-center">
                        {/* Avatar dengan fitur klik untuk ubah */}
                        <div className="relative group cursor-pointer mb-4">
                            <input
                                type="file"
                                id="avatar-input"
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
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
                                {/* Overlay hover efek */}
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-[10px] text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                                    Ubah Foto
                                </div>
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

                {/* Edit forms */}
                <div className="xl:col-span-2">
                    {/* Tabs */}
                    <div className="flex gap-0 border-b border-ink-100 mb-5">
                        {[
                            { id: 'info', label: 'Informasi Pribadi', icon: User },
                            // { id: 'password', label: 'Ubah Password', icon: Lock },
                        ].map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setTab(id)}
                                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-all ${tab === id ? 'text-teal-700 border-teal-400' : 'text-ink-500 border-transparent hover:text-ink-800'
                                    }`}
                            >
                                <Icon size={13} /> {label}
                            </button>
                        ))}
                    </div>

                    {/* Info tab */}
                    {tab === 'info' && (
                        <div className="card animate-fade-up">
                            <div className="text-sm font-medium text-ink-900 mb-4">Edit informasi pribadi</div>
                            <div className="flex flex-col gap-4">
                                <div>
                                    <label className="form-label">Nama lengkap</label>
                                    <div className="relative">
                                        <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                                        <input
                                            className="form-input pl-9"
                                            value={infoForm.username}
                                            onChange={e => setInfoForm(f => ({ ...f, username: e.target.value }))}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="form-label">Email</label>
                                    <div className="relative">
                                        <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                                        <input
                                            type="email"
                                            className="form-input pl-9"
                                            value={infoForm.email}
                                            onChange={e => setInfoForm(f => ({ ...f, email: e.target.value }))}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="form-label">Role</label>
                                    <input className="form-input bg-ink-50 cursor-not-allowed" value={roleLabel} readOnly />
                                    <p className="text-[10px] text-ink-400 mt-1">Role tidak dapat diubah sendiri</p>
                                </div>
                                <div className="flex justify-end pt-2">
                                    <button className="btn-primary" onClick={handleSaveInfo} disabled={saving}>
                                        {saving ? <Spinner size={14} className="text-white" /> : <Save size={14} />}
                                        Simpan perubahan
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Password tab */}
                    {tab === 'password' && (
                        <div className="card animate-fade-up">
                            <div className="text-sm font-medium text-ink-900 mb-4">Ubah password</div>
                            <div className="flex flex-col gap-4">
                                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700">
                                    Password baru minimal 6 karakter. Setelah diubah, Anda akan tetap login.
                                </div>
                                <div>
                                    <label className="form-label">Password baru</label>
                                    <div className="relative">
                                        <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                                        <input
                                            type={showPw ? 'text' : 'password'}
                                            className="form-input pl-9 pr-9"
                                            placeholder="Min. 6 karakter"
                                            value={pwForm.password}
                                            onChange={e => setPwForm(f => ({ ...f, password: e.target.value }))}
                                        />
                                        <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400" onClick={() => setShowPw(v => !v)}>
                                            {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                    </div>
                                    {/* Strength indicator */}
                                    {pwForm.password && (
                                        <div className="mt-2 flex gap-1">
                                            {[1, 2, 3, 4].map(i => (
                                                <div key={i} className={`h-1 flex-1 rounded-full transition-all ${pwForm.password.length >= i * 2
                                                    ? i <= 2 ? 'bg-rose-400' : i === 3 ? 'bg-amber-400' : 'bg-teal-400'
                                                    : 'bg-ink-100'
                                                    }`} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="form-label">Konfirmasi password</label>
                                    <div className="relative">
                                        <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                                        <input
                                            type="password"
                                            className={`form-input pl-9 ${pwForm.confirm && pwForm.confirm !== pwForm.password ? 'border-rose-400 focus:border-rose-400' : ''}`}
                                            placeholder="Ulangi password"
                                            value={pwForm.confirm}
                                            onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                                        />
                                    </div>
                                    {pwForm.confirm && pwForm.confirm !== pwForm.password && (
                                        <p className="text-xs text-rose-500 mt-1">Password tidak cocok</p>
                                    )}
                                </div>
                                <div className="flex justify-end pt-2">
                                    <button className="btn-primary" onClick={handleSavePw} disabled={saving}>
                                        {saving ? <Spinner size={14} className="text-white" /> : <Save size={14} />}
                                        Ubah password
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
