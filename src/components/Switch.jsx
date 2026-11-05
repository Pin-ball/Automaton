import { cn } from '@src/lib/utils.js'
import PropTypes from 'prop-types'
import { useId } from 'react'

export default function Switch({ children, onClick, active, disabled }) {
  const labelId = useId()

  return (
    <div className="flex justify-between">
      <span id={labelId} className={cn({ 'text-input': disabled })}>
        {children}
      </span>

      <button
        type="button"
        role="switch"
        aria-checked={active}
        aria-labelledby={labelId}
        disabled={disabled}
        onClick={onClick}
        className="bg-secondary group inline-block rounded-full border p-1"
      >
        <span
          className={cn(
            'block size-4 rounded-full transition-all',
            active ? 'ml-5' : 'mr-5',
            disabled && 'bg-accent',
            !disabled && (active ? 'bg-primary' : 'bg-input group-hover:bg-muted-foreground'),
          )}
        />
      </button>
    </div>
  )
}

Switch.propTypes = {
  onClick: PropTypes.func,
  active: PropTypes.bool,
  disabled: PropTypes.bool,
  children: PropTypes.node,
}
