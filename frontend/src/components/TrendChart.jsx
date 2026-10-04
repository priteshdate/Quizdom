import { useState } from "react";

// data: [{ year, e, m, t, o }]  (same shape Weightage.jsx already builds)
const SERIES = [
  { key: "o", name: "Overall", color: "#ffffff" },
  { key: "e", name: "Easy", color: "#3ddc84" },
  { key: "m", name: "Medium", color: "#f2b01e" },
  { key: "t", name: "Tough", color: "#ff4b55" },
];

const W = 640, H = 300, L = 42, R = 22, T = 20, B = 40;

function TrendChart({ data }) {

  const [hidden, setHidden] = useState([]); // series switched off via legend
  const [hover, setHover] = useState(null); // hovered year index

  const n = data.length;
  const rawMax = Math.max(1, ...data.flatMap((d) => SERIES.map((s) => d[s.key])));
  const yMax = Math.ceil(rawMax / 4) * 4; // fixed from ALL series so toggling never rescales

  const x = (i) => (n === 1 ? (L + W - R) / 2 : L + (i * (W - L - R)) / (n - 1));
  const y = (v) => T + (1 - v / yMax) * (H - T - B);
  const colW = (W - L - R) / Math.max(n - 1, 1);

  const ticks = [0, 1, 2, 3, 4].map((i) => (yMax * i) / 4);
  const visible = SERIES.filter((s) => !hidden.includes(s.key));

  const line = (key) =>
    data.map((d, i) => `${i ? "L" : "M"}${x(i)} ${y(d[key])}`).join(" ");

  const area = `${line("o")} L${x(n - 1)} ${y(0)} L${x(0)} ${y(0)} Z`;

  function toggle(key) {
    setHidden((p) => (p.includes(key) ? p.filter((k) => k !== key) : [...p, key]));
  }

  // tooltip geometry
  const tip = hover !== null ? data[hover] : null;
  const bw = 120;
  const bh = 26 + visible.length * 16;
  const tx = tip ? (x(hover) > W * 0.6 ? x(hover) - bw - 10 : x(hover) + 10) : 0;

  return (
    <>
      <div className="qz-legend">
        {SERIES.map((s) => (
          <button
            key={s.key}
            className="qz-legend-item"
            style={{ opacity: hidden.includes(s.key) ? 0.35 : 1 }}
            onClick={() => toggle(s.key)}
          >
            <span className="qz-dot" style={{ background: s.color }}></span>
            {s.name}
          </button>
        ))}
      </div>

      <svg
        className="qz-chart"
        viewBox={`0 0 ${W} ${H}`}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id="qzArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e6232d" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#e6232d" stopOpacity="0" />
          </linearGradient>
        </defs>

        {ticks.map((v) => (
          <g key={v}>
            <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke="#242830" />
            <text x={L - 8} y={y(v) + 4} textAnchor="end" fill="#858a93" fontSize="11">{v}</text>
          </g>
        ))}

        {data.map((d, i) => (
          <text key={d.year} x={x(i)} y={H - 14} textAnchor="middle"
            fill={hover === i ? "#ffffff" : "#858a93"} fontSize="11">{d.year}</text>
        ))}

        {hover !== null && (
          <line x1={x(hover)} x2={x(hover)} y1={T} y2={H - B}
            stroke="#e6232d" strokeDasharray="4 4" opacity="0.7" />
        )}

        {!hidden.includes("o") && <path d={area} fill="url(#qzArea)" className="qz-area" />}

        {visible.map((s) => (
          <g key={s.key}>
            <path
              d={line(s.key)}
              pathLength="1"
              fill="none"
              stroke={s.color}
              strokeWidth={s.key === "o" ? 3 : 2}
              strokeLinejoin="round"
              strokeLinecap="round"
              className="qz-line"
            />
            {data.map((d, i) => (
              <circle
                key={i}
                cx={x(i)}
                cy={y(d[s.key])}
                r={hover === i ? 6 : 4}
                fill="#07090c"
                stroke={s.color}
                strokeWidth="2"
                className="qz-pt"
                style={{ animationDelay: `${0.7 + i * 0.08}s` }}
              />
            ))}
          </g>
        ))}

        {tip && (
          <g className="qz-tip" pointerEvents="none">
            <rect x={tx} y={T + 4} width={bw} height={bh} fill="#111419" stroke="#343841" />
            <text x={tx + 10} y={T + 20} fill="#ffffff" fontSize="11" fontWeight="800">{tip.year}</text>
            {visible.map((s, j) => (
              <text key={s.key} x={tx + 10} y={T + 36 + j * 16} fill={s.color} fontSize="11">
                {s.name}: {tip[s.key]}
              </text>
            ))}
          </g>
        )}

        {data.map((d, i) => (
          <rect
            key={d.year}
            x={x(i) - colW / 2}
            y={T}
            width={colW}
            height={H - T - B}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
            onClick={() => setHover(i)}
          />
        ))}
      </svg>
    </>
  );
}

export default TrendChart;
