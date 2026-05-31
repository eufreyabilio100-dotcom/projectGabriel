import { useState, useEffect, useRef } from 'react'

export function useCountUp(end, duration = 2000) {
  const [count, setCount] = useState(0)
  const prevEndRef = useRef(0)
  const animationRef = useRef(null)

  useEffect(() => {
    if (end === 0 || end === prevEndRef.current) return

    prevEndRef.current = end

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    let startTime = null
    const startValue = count

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(startValue + eased * (end - startValue)))
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(step)
      }
    }

    animationRef.current = requestAnimationFrame(step)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [end, duration])

  return count
}
