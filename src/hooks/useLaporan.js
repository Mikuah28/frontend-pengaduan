// src/hooks/useLaporan.js
'use client'
import { useState, useEffect, useCallback } from 'react'
import { laporanApi } from '@/lib/api'

export function useLaporan(params = {}) {
  const [data, setData]     = useState([])
  const [meta, setMeta]     = useState({ total: 0, totalPages: 1, page: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)

  const load = useCallback(async (overrides = {}) => {
    setLoading(true)
    setError(null)
    try {
      const res = await laporanApi.getAll({ ...params, ...overrides })
      setData(res.data.data || [])
      setMeta(res.data.meta || { total: 0, totalPages: 1, page: 1 })
    } catch (e) {
      setError(e.response?.data?.message || 'Gagal memuat laporan')
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(params)])

  useEffect(() => { load() }, [load])

  return { data, meta, loading, error, reload: load }
}

export function useKomentar(laporan_id) {
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!laporan_id) return
    setLoading(true)
    try {
      const { komentarApi } = await import('@/lib/api')
      const res = await komentarApi.getByLaporan(laporan_id)
      setData(res.data.data || [])
    } catch {
      setData([])
    } finally {
      setLoading(false)
    }
  }, [laporan_id])

  useEffect(() => { load() }, [load])
  return { data, loading, reload: load }
}
