import React, { createContext, useContext, useEffect, useState } from 'react'
import api from '../util/axiosClient'

type Status = { id: number; name: string; color: string }

type StatusContextType = {
  statuses: Status[]
  loading: boolean
}

const StatusContext = createContext<StatusContextType>({ statuses: [], loading: false })

export const StatusProvider: React.FC<{ apiEndPoint: string; children: React.ReactNode }> = ({
  apiEndPoint,
  children
}) => {
  const [statuses, setStatuses] = useState<Status[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchStatuses() {
      setLoading(true)
      try {
        const res = await api.get(apiEndPoint)
        setStatuses(res.data.data)
      } catch (e) {
        console.error('Lỗi khi lấy danh sách status', e)
      } finally {
        setLoading(false)
      }
    }
    fetchStatuses()
  }, [apiEndPoint])

  return <StatusContext.Provider value={{ statuses, loading }}>{children}</StatusContext.Provider>
}

export const useStatuses = () => useContext(StatusContext)
