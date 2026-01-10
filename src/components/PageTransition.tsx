import React, { useState, useEffect, useRef, useCallback } from 'react'
import { navigate } from 'gatsby'
import type { PageTransitionProps } from '../types'
import * as styles from './PageTransition.module.css'

const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  location,
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [displayChildren, setDisplayChildren] = useState(children)
  const previousPathRef = useRef(location.pathname)
  const isFirstRender = useRef(true)

  // Handle fade in on mount
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsVisible(true)
    }, 50)

    return () => clearTimeout(timeout)
  }, [])

  // Handle route changes
  useEffect(() => {
    // Skip first render - handled by mount effect
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    // Path changed - fade out, swap content, fade in
    if (location.pathname !== previousPathRef.current) {
      // Start fade out via CSS (isVisible becomes false via click handler)
      // After transition, update children and fade back in
      const timeout = setTimeout(() => {
        setDisplayChildren(children)
        previousPathRef.current = location.pathname
        setIsVisible(true)
      }, 300) // Match CSS transition duration

      return () => clearTimeout(timeout)
    }
  }, [location.pathname, children])

  // Intercept internal link clicks for fade-out effect
  const handleClick = useCallback(
    (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest('a')

      if (!anchor) return

      const href = anchor.getAttribute('href')
      if (!href) return

      // Only handle internal links (starting with /)
      if (!href.startsWith('/')) return

      // Don't handle if modifier keys are pressed
      if (e.metaKey || e.ctrlKey || e.shiftKey) return

      // Don't handle same-page links
      if (href === location.pathname) return

      e.preventDefault()
      setIsVisible(false)

      setTimeout(() => {
        navigate(href)
      }, 300) // Match CSS transition duration
    },
    [location.pathname]
  )

  useEffect(() => {
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [handleClick])

  return (
    <div
      className={`${styles.pageTransition} ${isVisible ? styles.visible : ''}`}
    >
      {displayChildren}
    </div>
  )
}

export default PageTransition
