import PropTypes from 'prop-types';
import { clsx } from 'clsx'
import Warning from "@src/components/Warning.jsx";

export default function Switch(props) {
  const {
    children,
    onClick,
    active,
    disabled,
  } = props

  function click() {
    if (!disabled)
      onClick()
  }

  return (
    <div className='flex justify-between'>
      <label className={clsx({
        'text-c-neutral-500': disabled
      })}>
        {children}
      </label>
      <div
        onClick={click}
        className='p-1 inline-block rounded-full border border-c-neutral-600 bg-c-neutral-800 group'>
        <div className={clsx('rounded-full h-4 w-4 transition-all',
          active && ['ml-5', {
            'bg-c-neutral-600': disabled,
            'bg-c-yellow-500': !disabled
          }],
          !active && ['mr-5', {
            'bg-c-neutral-600': disabled,
            'bg-c-neutral-500 group-hover:bg-c-neutral-400': !disabled
          }]
        )}></div>
      </div>
    </div>
  )
}

Switch.displayName = 'Switch';
Switch.propTypes = {
  onClick: PropTypes.func,
  active: PropTypes.bool,
  disabled: PropTypes.bool,
  children: PropTypes.node
}
