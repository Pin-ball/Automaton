import { cn } from '@src/lib/utils.js'
import { cva } from 'class-variance-authority'
import PropTypes from 'prop-types'

const buttonVariants = cva('rounded-lg border', {
  variants: {
    variant: {
      primary: 'border-primary bg-primary stroke-primary-foreground p-2',
      secondary: 'disabled:bg-accent px-4 py-2',
    },
    active: {
      true: '',
      false: '',
    },
  },
  compoundVariants: [
    {
      variant: 'secondary',
      active: true,
      className: 'border-primary bg-primary stroke-primary-foreground',
    },
    {
      variant: 'secondary',
      active: false,
      className: 'bg-secondary active:bg-background',
    },
  ],
  defaultVariants: { variant: 'secondary', active: false },
})

export default function Button({ variant, active, className, type = 'button', ...props }) {
  return (
    <button
      type={type}
      aria-disabled={props.disabled}
      className={cn(buttonVariants({ variant, active }), className)}
      {...props}
    />
  )
}

Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary']),
  active: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  type: PropTypes.string,
  children: PropTypes.node,
}
