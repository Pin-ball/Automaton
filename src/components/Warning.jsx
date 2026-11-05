import PropTypes from 'prop-types'

export default function Warning({ children }) {
  return (
    <div className="bg-secondary absolute top-2 left-1/2 -translate-x-1/2 transform rounded-lg border px-4 py-2">
      {children}
    </div>
  )
}

Warning.displayName = 'Warning'
Warning.propTypes = {
  children: PropTypes.node,
}
