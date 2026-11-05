import { ChevronDownIcon } from '@heroicons/react/24/outline/index.js'
import { cn } from '@src/lib/utils.js'
import PropTypes from 'prop-types'
import { useEffect, useRef, useState } from 'react'

export default function Selector({ label, icon, options, value, active, onSelect, className }) {
  const rootRef = useRef(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return

    function close(e) {
      if (!rootRef.current.contains(e.target)) setOpen(false)
    }

    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [open])

  function select(id) {
    onSelect(id)
    setOpen(false)
  }

  return (
    <div
      ref={rootRef}
      className={cn(
        'relative flex max-w-36 grow rounded-lg border',
        active
          ? 'bg-primary stroke-primary-foreground fill-primary-foreground'
          : 'bg-secondary active:bg-background',
        className,
      )}
    >
      <button
        type="button"
        aria-label={label}
        className="flex grow items-center py-2 pl-4"
        onClick={() => onSelect(value)}
      >
        {icon}
      </button>

      <button
        type="button"
        aria-label={`${label} options`}
        aria-expanded={open}
        className="group flex items-center px-2"
        onClick={() => setOpen((isOpen) => !isOpen)}
      >
        <ChevronDownIcon className="w-4 stroke-inherit transition-all duration-150 group-hover:mt-1.5" />
      </button>

      {open && (
        <ul
          aria-label={label}
          className="bg-popover absolute top-11 left-0 z-10 min-w-56 rounded-lg border py-1 font-extralight"
        >
          {options.map((option) => {
            const isSelected = option.id === value

            return (
              <li key={option.id} className="mx-2 my-1">
                <button
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => select(option.id)}
                  className={cn('w-full rounded-sm px-2 py-0.5 text-left', {
                    'bg-primary text-primary-foreground': isSelected && active,
                    'bg-input hover:bg-accent': isSelected && !active,
                    'active:bg-card hover:bg-accent': !isSelected,
                  })}
                >
                  {option.name}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

Selector.propTypes = {
  label: PropTypes.string.isRequired,
  icon: PropTypes.node,
  options: PropTypes.arrayOf(
    PropTypes.shape({ id: PropTypes.number.isRequired, name: PropTypes.string.isRequired }),
  ).isRequired,
  value: PropTypes.number,
  active: PropTypes.bool,
  onSelect: PropTypes.func.isRequired,
  className: PropTypes.string,
}
