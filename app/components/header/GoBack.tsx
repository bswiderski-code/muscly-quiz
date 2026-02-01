// app/(funnels)/plan-formularz/_components/GoBack.tsx
'use client'

type Props = {
  /** go back action */
  onClick?: () => void // Explicitly define the onClick prop
  /** optional className for outer wrapper */
  className?: string
}

export default function GoBack({ onClick, className }: Props) {
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
        padding: 0,
        cursor: onClick ? 'pointer' : 'default',
        opacity: 1, // Fully black, no grayed-out state
        marginLeft: 16, // Added margin-left
        marginTop: 16, // Added margin-top
      }}
    >
      <img
        src="/btns/goback.svg"
        alt="Cofnij"
        width={32}
        height={32}
        style={{ display: 'block' }}
      />
    </button>
  )
}
