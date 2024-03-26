import PropTypes from 'prop-types';
import {lazy, Suspense, useMemo} from 'react';

export default function LazyIcon ({icon, ...props}) {
  const Component = useMemo(
    () => lazy(async () => {
      try {
        return await import('./assets/' + icon)
      } catch (e) {
        console.log(e)
        return await import('./assets/default')
      }
    }),
    [icon]);

  if (!Component) return null;

  return (
      <Suspense fallback={null}>
        <Component {...props}/>
      </Suspense>
  )
}

LazyIcon.propTypes = {
  icon: PropTypes.string,
  props: PropTypes.object
}
