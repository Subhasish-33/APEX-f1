export const monzaTrackConfig = {
  id: "monza",
  name: "Autodromo Nazionale Monza",
  country: "Italy",
  personality: {
    primaryGlow: "#00f0ff", // Cyan
    secondaryGlow: "#a855f7", // Purple
    atmosphere: "velocity-focused",
    ambientBlur: "blur(40px)"
  },
  // Pseudo-3D layered SVG path for Monza. This path represents the centerline.
  // The UI will stroke this path multiple times with different opacities and widths to create depth.
  svgPath: "M100 250 C 150 150, 400 200, 500 220 C 600 240, 700 260, 800 150 C 850 100, 900 100, 950 150 C 1000 200, 950 250, 800 350 L 300 500 C 200 550, 150 500, 100 450 C 50 400, 50 350, 100 250 Z",
  length: 5793, // meters
  sectors: [
    { id: 1, startPercentage: 0, endPercentage: 0.35, label: "Sector 1" },
    { id: 2, startPercentage: 0.35, endPercentage: 0.70, label: "Sector 2" },
    { id: 3, startPercentage: 0.70, endPercentage: 1.0, label: "Sector 3" }
  ],
  keyCorners: [
    { percentage: 0.1, label: "Prima Variante" },
    { percentage: 0.25, label: "Curva Grande" },
    { percentage: 0.45, label: "Lesmo 1" },
    { percentage: 0.55, label: "Lesmo 2" },
    { percentage: 0.8, label: "Ascari" },
    { percentage: 0.95, label: "Parabolica" }
  ]
};
