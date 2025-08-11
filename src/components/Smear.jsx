export default function Smear() {
  return (
    <>
      <div className="o">
        <div className="o1"></div>
        <div className="o1 o2"></div>
      </div>

      <svg>
        <filter id="gooey">
          <feGaussianBlur in="SourceGraphic" stdDeviation="10"></feGaussianBlur>
          <feColorMatrix
            values="
            1 0 0 0 0
            0 1 0 0 0
            0 0 1 0 0
            0 0 0 20 -10"
          ></feColorMatrix>
        </filter>
      </svg>
    </>
  );
}

Smear.propTypes = {};
