// =====================================================
// SAMPLE DATA - hardcoded for now.
// Chapter names and High/Medium/Lower tiers follow the
// structure of competishun's JEE Mains weightage pages,
// but the E/M/T question counts below are INVENTED for
// the UI. Replace with real data / backend later.
// E = Easy, M = Medium, T = Tough, O = Overall (E+M+T)
// =====================================================

export const YEARS = [2022, 2023, 2024, 2025, 2026];

// Each row: [chapter name, tier, approx questions per paper, [easy, medium, tough] base per year]
const PHYSICS_ROWS = [
  ["Mechanics (Laws, Work-Energy, Rotation)", "High", "4-5", [2, 2, 1]],
  ["Modern Physics", "High", "3-4", [1, 2, 1]],
  ["Electrostatics + Current Electricity", "High", "3-4", [1, 2, 1]],
  ["Magnetism + EMI + AC", "High", "3-4", [1, 2, 1]],
  ["Optics (Ray + Wave)", "Medium", "2-3", [1, 1, 1]],
  ["Heat and Thermodynamics", "Medium", "2-3", [1, 1, 1]],
  ["SHM and Waves", "Medium", "1-2", [1, 1, 0]],
  ["Units, Dimensions and Measurement", "Medium", "1-2", [1, 1, 0]],
  ["Semiconductors and Communication", "Lower", "1-2", [1, 1, 0]],
  ["Gravitation, Fluids, Elasticity", "Lower", "1-2", [1, 1, 0]],
];

const CHEMISTRY_ROWS = [
  ["Mole Concept", "High", "1-2", [1, 1, 0]],
  ["Thermodynamics and Thermochemistry", "High", "1-2", [1, 1, 0]],
  ["Ionic and Chemical Equilibrium", "High", "1-2", [1, 1, 0]],
  ["Electrochemistry", "High", "1-2", [1, 1, 0]],
  ["Chemical Bonding", "High", "2", [1, 1, 0]],
  ["Coordination Compounds", "High", "2", [1, 1, 0]],
  ["p-block Elements", "High", "2", [1, 1, 0]],
  ["General Organic Chemistry", "High", "2-3", [1, 1, 1]],
  ["Aldehydes, Ketones and Acids", "High", "2", [1, 1, 0]],
  ["Alcohols, Phenols and Ethers", "Medium", "1-2", [1, 1, 0]],
  ["Chemical Kinetics", "Medium", "1", [1, 0, 0]],
  ["Solutions and Colligative Properties", "Medium", "1", [0, 1, 0]],
];

const MATHS_ROWS = [
  ["Integration (Definite + Indefinite)", "High", "3-4", [1, 2, 1]],
  ["Probability", "High", "3-4", [1, 2, 1]],
  ["Conic Sections", "High", "3", [1, 1, 1]],
  ["Limits, Continuity and Differentiability", "High", "3", [1, 1, 1]],
  ["Matrices and Determinants", "High", "3", [1, 2, 0]],
  ["Differential Equations", "High", "2-3", [1, 1, 1]],
  ["Vector and 3D Geometry", "Medium", "3", [1, 1, 1]],
  ["Sequences and Series", "Medium", "2", [1, 1, 0]],
  ["Complex Numbers and Quadratics", "Medium", "2", [1, 1, 0]],
  ["Binomial Theorem", "Medium", "1-2", [1, 1, 0]],
  ["Straight Lines", "Medium", "1-2", [1, 1, 0]],
  ["Statistics", "Lower", "1", [1, 0, 0]],
];

// Deterministic "noise": returns -1, 0 or +1 from a seed number.
// Same input always gives same output, so the charts don't change on refresh.
function wobble(seed) {
  return ((seed * 7 + 3) % 3) - 1;
}

function build(rows) {
  return rows.map(([name, tier, approx, base], chapterIndex) => {
    const yearly = {};

    YEARS.forEach((year, yearIndex) => {
      const [e, m, t] = base.map((count, k) =>
        Math.max(0, count + wobble(chapterIndex * 5 + yearIndex * 2 + k))
      );

      yearly[year] = { e, m, t };
    });

    return { name, tier, approx, yearly };
  });
}

export const WEIGHTAGE = {
  Physics: build(PHYSICS_ROWS),
  Chemistry: build(CHEMISTRY_ROWS),
  Maths: build(MATHS_ROWS),
};
