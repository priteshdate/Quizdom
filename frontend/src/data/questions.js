// =====================================================
// HARDCODED QUESTION BANK
// answer = index (0-3) of the correct option
// Later, replace this file with a fetch() to your backend.
// =====================================================

export const SUBJECTS = ["Physics", "Chemistry", "Maths"];

export const QUESTIONS = {

  Physics: [
    {
      id: "p1",
      text: "The dimensional formula of Planck's constant (h) is:",
      options: ["ML²T⁻¹", "MLT⁻¹", "ML²T⁻²", "ML⁻¹T²"],
      answer: 0,
    },
    {
      id: "p2",
      text: "A ball is thrown vertically upward at 20 m/s. Taking g = 10 m/s², the maximum height reached is:",
      options: ["10 m", "20 m", "30 m", "40 m"],
      answer: 1,
    },
    {
      id: "p3",
      text: "Resistors of 4 Ω and 6 Ω are connected in parallel. The equivalent resistance is:",
      options: ["10 Ω", "5 Ω", "1.5 Ω", "2.4 Ω"],
      answer: 3,
    },
    {
      id: "p4",
      text: "A force of 10 N displaces a body by 5 m, with the displacement at 60° to the force. The work done is:",
      options: ["50 J", "25 J", "43.3 J", "0 J"],
      answer: 1,
    },
    {
      id: "p5",
      text: "The escape velocity from the Earth's surface is approximately:",
      options: ["7.9 km/s", "9.8 km/s", "11.2 km/s", "15.0 km/s"],
      answer: 2,
    },
    {
      id: "p6",
      text: "The de Broglie wavelength of a particle with momentum p is:",
      options: ["hp", "p/h", "h·p²", "h/p"],
      answer: 3,
    },
    {
      id: "p7",
      text: "A simple pendulum of length 1 m is at a place where g = π² m/s². Its time period is:",
      options: ["2 s", "1 s", "π s", "2π s"],
      answer: 0,
    },
    {
      id: "p8",
      text: "Inside a charged hollow conducting sphere, the electric field is:",
      options: ["kQ/r²", "Q/ε₀", "Zero", "Infinite"],
      answer: 2,
    },
    {
      id: "p9",
      text: "The speed of light in a medium of refractive index 1.5 (c = 3×10⁸ m/s) is:",
      options: ["3×10⁸ m/s", "2×10⁸ m/s", "4.5×10⁸ m/s", "1.5×10⁸ m/s"],
      answer: 1,
    },
    {
      id: "p10",
      text: "For an ideal gas undergoing an isothermal process, the change in internal energy is:",
      options: ["Zero", "Positive", "Negative", "Equal to the heat absorbed"],
      answer: 0,
    },
  ],

  Chemistry: [
    {
      id: "c1",
      text: "The number of unpaired electrons in Fe³⁺ (Z = 26) is:",
      options: ["3", "4", "5", "6"],
      answer: 2,
    },
    {
      id: "c2",
      text: "The pH of a 0.01 M HCl solution is:",
      options: ["1", "2", "7", "12"],
      answer: 1,
    },
    {
      id: "c3",
      text: "The hybridisation of carbon in methane (CH₄) is:",
      options: ["sp", "sp²", "sp³", "sp³d"],
      answer: 2,
    },
    {
      id: "c4",
      text: "Which gas is evolved when zinc reacts with dilute HCl?",
      options: ["Hydrogen", "Chlorine", "Oxygen", "Carbon dioxide"],
      answer: 0,
    },
    {
      id: "c5",
      text: "How many moles are present in 36 g of water (molar mass 18 g/mol)?",
      options: ["1", "2", "0.5", "4"],
      answer: 1,
    },
    {
      id: "c6",
      text: "Which of the following is an alkane?",
      options: ["C₂H₄", "C₂H₂", "C₆H₆", "C₃H₈"],
      answer: 3,
    },
    {
      id: "c7",
      text: "The IUPAC name of CH₃–CH₂–OH is:",
      options: ["Methanol", "Ethanol", "Propanol", "Ethanal"],
      answer: 1,
    },
    {
      id: "c8",
      text: "Which element has the highest electronegativity?",
      options: ["Fluorine", "Oxygen", "Chlorine", "Nitrogen"],
      answer: 0,
    },
    {
      id: "c9",
      text: "The unit of the rate constant (k) of a first-order reaction is:",
      options: ["mol L⁻¹ s⁻¹", "s⁻¹", "L mol⁻¹ s⁻¹", "mol² L⁻² s⁻¹"],
      answer: 1,
    },
    {
      id: "c10",
      text: "In the Haber process for ammonia, the catalyst used is:",
      options: ["Platinum", "Nickel", "Iron", "Vanadium pentoxide"],
      answer: 2,
    },
  ],

  Maths: [
    {
      id: "m1",
      text: "If f(x) = x², then f′(3) equals:",
      options: ["3", "6", "9", "12"],
      answer: 1,
    },
    {
      id: "m2",
      text: "∫ 2x dx equals:",
      options: ["x² + C", "2x² + C", "x + C", "2 + C"],
      answer: 0,
    },
    {
      id: "m3",
      text: "The sum of the first 10 natural numbers is:",
      options: ["45", "50", "55", "60"],
      answer: 2,
    },
    {
      id: "m4",
      text: "The roots of x² − 5x + 6 = 0 are:",
      options: ["1 and 6", "2 and 3", "−2 and −3", "−1 and 6"],
      answer: 1,
    },
    {
      id: "m5",
      text: "sin²θ + cos²θ is equal to:",
      options: ["0", "2", "sinθ cosθ", "1"],
      answer: 3,
    },
    {
      id: "m6",
      text: "The determinant of the matrix [[1, 2], [3, 4]] is:",
      options: ["−2", "2", "10", "−10"],
      answer: 0,
    },
    {
      id: "m7",
      text: "The distance between the points (0, 0) and (3, 4) is:",
      options: ["7", "5", "25", "1"],
      answer: 1,
    },
    {
      id: "m8",
      text: "The limit of (sin x) / x as x → 0 is:",
      options: ["0", "∞", "1", "Does not exist"],
      answer: 2,
    },
    {
      id: "m9",
      text: "In how many ways can 4 distinct books be arranged on a shelf?",
      options: ["24", "16", "12", "8"],
      answer: 0,
    },
    {
      id: "m10",
      text: "If i = √−1, then i⁴ equals:",
      options: ["−1", "i", "−i", "1"],
      answer: 3,
    },
  ],

};
