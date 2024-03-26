import PropTypes from "prop-types";

const Bolt = ({ width = 24,
                 height = 24,
                 stroke= 'inherit',
                 strokeWidth = 1.5,
                 fill = 'none',
                 className = ''
}) => (
  <svg xmlns="http://www.w3.org/2000/svg" version="1.1"
       viewBox="0 0 21 21"
       width={width}
       height={height}
       className={className}
       fill={fill}
       strokeWidth={strokeWidth}
       stroke={stroke}
       strokeLinecap='round'
       strokeLinejoin='round'>
      <g fill="none" fillRule="evenodd" transform="matrix(0 1 1 0 2.5 2.5)">
        <path d="m3.98652376 1.07807068c-2.38377179 1.38514556-3.98652376 3.96636605-3.98652376 6.92192932 0 4.418278 3.581722 8 8 8s8-3.581722 8-8-3.581722-8-8-8"></path>
        <path d="m4 1v4h-4" transform="matrix(1 0 0 -1 0 6)"></path>
      </g>
  </svg>
);



Bolt.propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    fill: PropTypes.string,
    stroke: PropTypes.string,
    strokeWidth: PropTypes.number,
    className: PropTypes.string
}
export default Bolt