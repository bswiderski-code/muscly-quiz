'use client'

import { useEffect, useState, useRef } from 'react'
import styles from './StickyScroll.module.css'

export default function StickyScroll({ targetId }: { targetId: string }) {
  const [isVisible, setIsVisible] = useState(false)
  const [isNearForm, setIsNearForm] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    // Show button after a short delay
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 1000)

    // Set up intersection observer for the form section
    const targetElement = document.getElementById(targetId)
    if (targetElement) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsNearForm(true)
            } else {
              setIsNearForm(false)
            }
          })
        },
        {
          rootMargin: '0px 0px -50px 0px', // Trigger when form is 50px from bottom of viewport
          threshold: 0.1
        }
      )
      observerRef.current.observe(targetElement)
    }

    return () => {
      clearTimeout(timer)
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [targetId])

  const handleScroll = () => {
    const element = document.getElementById(targetId)
    if (element) {
      // Calculate position to scroll to (center the element or top with offset)
      const y = element.getBoundingClientRect().top + window.scrollY - 40
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  return (
    <div
      className={`btn btn-primary ${styles.container} ${isVisible && !isNearForm ? styles.visible : ''}`}
      onClick={handleScroll}
      role="button"
      aria-label="Przewiń do formularza"
      style={{
        padding: '12px 24px',
        fontSize: 18,
        textAlign: 'center',
        cursor: 'pointer',
      }}
    >
      Przejdź do planu
    </div>
  )
}
