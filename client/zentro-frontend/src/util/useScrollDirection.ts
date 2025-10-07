import { useEffect, useRef, useState } from 'react'

export function useScrollDirection({ threshold = 12, initialDirection = 'down' } = {}) {
  const [direction, setDirection] = useState<'up' | 'down'>(initialDirection)
  const lastScrollY = useRef(typeof window !== 'undefined' ? window.scrollY : 0)

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY
      const diff = currentY - lastScrollY.current

      if (Math.abs(diff) > threshold) {
        setDirection(diff > 0 ? 'down' : 'up')
        lastScrollY.current = currentY
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [threshold])

  return direction
}
