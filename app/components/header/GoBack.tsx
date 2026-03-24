import * as React from 'react'
import { useTranslations } from 'next-intl'

type Props = {
  /** go back action */
  onClick?: () => void // Explicitly define the onClick prop
  /** optional className for outer wrapper */
  className?: string
}

export default function GoBack({ onClick, className }: Props) {
  const t = useTranslations('NextButton')
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Back"
      className={className}
      style={{
        appearance: 'none',
        border: 'none',
        background: 'transparent',
        padding: '8px 16px',
        cursor: onClick ? 'pointer' : 'default',
        opacity: onClick ? 1 : 0.4,
        marginLeft: 16,
        marginTop: 16,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.5 16L7 10L12.5 4" stroke="#FAFAFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  )
}
