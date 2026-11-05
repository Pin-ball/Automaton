import { cn } from '@src/lib/utils.js'
import PropTypes from 'prop-types'

export default function Box(props) {
  const { title, padding = true, className, children } = props

  return (
    <div className={cn('bg-card rounded-lg', { 'px-5 py-3': padding }, className)}>
      {title ? (
        <h3 className="decoration-input mb-8 underline underline-offset-8">{title}</h3>
      ) : null}
      {children}
    </div>
  )
}

Box.displayName = 'Box'
Box.propTypes = {
  title: PropTypes.string,
  padding: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node,
}
