import PropTypes from "prop-types";

const Erase = ({ width = 24,
                 height = 24,
                 stroke= 'inherit',
                 strokeWidth = 5,
                 fill = 'inherit',
                 className = ''
}) => (
  <svg xmlns="http://www.w3.org/2000/svg" version="1.1"
       viewBox="0 0 256 256"
       width={width}
       height={height}
       className={className}
       fill={fill}
       strokeWidth={strokeWidth}
       stroke={stroke}
       strokeLinecap='round'
       strokeLinejoin='round'>
    <path d="M216.001,211.833H120.6875l98.14258-98.1416a20.0237,20.0237,0,0,0-.001-28.28418L173.57422,40.15234a20.01987,20.01987,0,0,0-28.2832,0l-56.564,56.564-.00537.00439-.00439.00537-56.564,56.564a20.02163,20.02163,0,0,0,0,28.2832l37.08887,37.08789a4.00051,4.00051,0,0,0,2.82812,1.17188H216.001a4,4,0,0,0,0-8ZM150.94727,45.80859a12.0157,12.0157,0,0,1,16.9707,0l45.25488,45.25489a12.016,12.016,0,0,1,0,16.97168L159.43213,161.7749,97.20654,99.54932ZM109.37305,211.833H73.72754l-35.918-35.916a12.01392,12.01392,0,0,1,0-16.9707l53.74072-53.74072,62.22559,62.22558Z"/>
  </svg>
);

Erase.propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    fill: PropTypes.string,
    stroke: PropTypes.string,
    strokeWidth: PropTypes.number,
    className: PropTypes.string
}
export default Erase