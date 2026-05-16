import { useState, useEffect, useCallback } from 'react'

interface ToastMessage {
  id: number
  text: string
}

let nextId = 0
let globalAdd: ((text: string) => void) | null = null

export function showToast(text: string) {
  if (globalAdd) globalAdd(text)
}

function Toast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const add = useCallback((text: string) => {
    const id = nextId++
    setToasts((prev) => [...prev, { id, text }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 2500)
  }, [])

  useEffect(() => {
    globalAdd = add
    return () => { globalAdd = null }
  }, [add])

  if (toasts.length === 0) return null

  return (
    <div className="fixed left-1/2 top-6 z-[100] flex -translate-x-1/2 flex-col items-center gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="rounded-xl border border-purple-500/30 bg-purple-500/20 px-6 py-3 text-sm text-white shadow-lg backdrop-blur-sm" style={{ animation: 'slideIn 0.3s ease-out' }}
        >
          {t.text}
        </div>
      ))}
    </div>
  )
}

export default Toast
