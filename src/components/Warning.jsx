import PropTypes from 'prop-types';
import { clsx } from 'clsx'

export default function Warning(props) {
  const {
    children,
    classNames,
  } = props

  return (
    <div className={clsx(classNames, 'absolute top-2 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg border bg-c-neutral-800  border-c-neutral-600')}>
      {children}
    </div>
  )
}

Warning.displayName = 'Warning';
Warning.propTypes = {
  children: PropTypes.node,
  classNames: PropTypes.string
}
