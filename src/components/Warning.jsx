import PropTypes from "prop-types";

export default function Warning({ children }) {
  return (
    <div className="absolute px-4 py-2 transform -translate-x-1/2 border rounded-lg top-2 left-1/2 bg-c-neutral-800 border-c-neutral-600">
      {children}
    </div>
  );
}

Warning.displayName = "Warning";
Warning.propTypes = {
  children: PropTypes.node,
};
