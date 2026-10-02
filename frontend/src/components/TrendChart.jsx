// Line chart drawn with plain SVG (no chart library needed).
// Props:
//   data = [{ year: 2022, e: 1, m: 2, t: 0, o: 3 }, ...]

const SERIES = [
  { key: "o", label: "Overall", color: "#4c9aff" },
  { key: "e", label: "Easy", color: "#22b07d" },
  { key: "m", label: "Medium", color: "#f2b01e" },
  { key: "t", label: "Tough", color: "#e6232d" },
];

const WIDTH = 700;
const HEIGHT = 320;
const MARGIN = { top: 20, right: 30, bottom: 45, left: 60 };

function TrendChart({ data }) {

  const innerWidth = WIDTH - MARGIN.left - MARGIN.right;
  const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom;

  // y axis goes 0 .. yMax in 4 equal steps (yMax is a multiple of 4)
  const biggest = Math.max(...data.map((d) => d.o));
  const yMax = Math.max(4, Math.ceil(biggest / 4) * 4);

  function x(index) {
    return MARGIN.left + (index * innerWidth) / (data.length - 1);
  }

  function y(value) {
    return MARGIN.top + innerHeight - (value / yMax) * innerHeight;
  }

  const gridValues = [0, 1, 2, 3, 4].map((step) => (step * yMax) / 4);

  return (

    <div>

      <div className="qz-legend">
        {SERIES.map((series) => (
          <span key={series.key} className="qz-legend-item">
            <i
              className="qz-dot"
              style={{ background: series.color }}
            ></i>
            {series.label}
          </span>
        ))}
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="qz-chart"
        role="img"
        aria-label="Questions per year by difficulty"
      >

        {/* horizontal dashed grid + y labels */}
        {gridValues.map((value) => (
          <g key={value}>
            <line
              x1={MARGIN.left}
              x2={WIDTH - MARGIN.right}
              y1={y(value)}
              y2={y(value)}
              stroke="#3a3f48"
              strokeDasharray="4 4"
            />
            <text
              x={MARGIN.left - 12}
              y={y(value) + 4}
              textAnchor="end"
              fill="#8a8f98"
              fontSize="12"
            >
              {value}
            </text>
          </g>
        ))}

        {/* vertical dashed lines + year labels */}
        {data.map((point, index) => (
          <g key={point.year}>
            <line
              x1={x(index)}
              x2={x(index)}
              y1={MARGIN.top}
              y2={MARGIN.top + innerHeight}
              stroke="#3a3f48"
              strokeDasharray="4 4"
            />
            <text
              x={x(index)}
              y={HEIGHT - 18}
              textAnchor="middle"
              fill="#8a8f98"
              fontSize="12"
            >
              {point.year}
            </text>
          </g>
        ))}

        {/* y axis title */}
        <text
          transform={`translate(16 ${MARGIN.top + innerHeight / 2}) rotate(-90)`}
          textAnchor="middle"
          fill="#8a8f98"
          fontSize="12"
        >
          No of Questions
        </text>

        {/* lines + dots */}
        {SERIES.map((series) => (
          <g key={series.key}>

            <polyline
              fill="none"
              stroke={series.color}
              strokeWidth="2.5"
              points={data
                .map((point, index) => `${x(index)},${y(point[series.key])}`)
                .join(" ")}
            />

            {data.map((point, index) => (
              <circle
                key={point.year}
                cx={x(index)}
                cy={y(point[series.key])}
                r="4"
                fill={series.color}
              >
                <title>
                  {series.label} {point.year}: {point[series.key]}
                </title>
              </circle>
            ))}

          </g>
        ))}

      </svg>

    </div>

  );
}

export default TrendChart;
