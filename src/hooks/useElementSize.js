import { useEffect, useState } from 'react'

export default function useElementSize(ref) {
  const [size, setSize] = useState(null)

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      setSize([entry.target.clientWidth, entry.target.clientHeight])
    })
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [ref])

  return size
}
