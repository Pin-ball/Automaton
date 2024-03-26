import Canvas from "@src/components/Canvas.jsx";
import PropTypes from "prop-types";
import { clsx } from 'clsx'

export default function Box(props) {
  const {
    title,
    padding = true,
    className,
    children
  } = props

  return (
    <div className={clsx(
      className,
      'bg-c-neutral-700 rounded-lg', {
        'py-3 px-5': padding
      }
    )}>
      { title
        ? <h3 className='mb-8 underline underline-offset-8 decoration-c-neutral-500'>{title}</h3>
        : null
      }
      {children}
    </div>
  )
}

Box.displayName = 'Box';
Canvas.propTypes = {
  title: PropTypes.string,
  padding: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node
}
