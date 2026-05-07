export interface TeamData {
  id: string;
  name: string;
  shortName: string;
  primaryColor: string;
  accentColor: string;
  modelPath: string;
  car: {
    chassis: string;
    engine: string;
    engineSupplier: string;
    gearbox: string;
    suspension: string;
    brakes: string;
    tyreSupplier: "Pirelli";
    weight: string;
    wheelbase: string;
  };
  technology: {
    drsSystem: string;
    ersSystem: string;
    mgukPower: string;
    fuelSystem: string;
    coolingSystem: string;
  };
  disclosed: {
    notes: string[];
  };
}

export const f1Teams2025: Record<string, TeamData> = {
  ferrari: {
    id: "ferrari",
    name: "Scuderia Ferrari HP",
    shortName: "Ferrari",
    primaryColor: "#E10600",
    accentColor: "#FFF200",
    modelPath: "/models/ferrari.glb",
    car: {
      chassis: "Ferrari Carbon-fiber composite monocoque",
      engine: "Ferrari 066/12",
      engineSupplier: "Ferrari",
      gearbox: "Ferrari 8-speed longitudinal carbon-fiber case",
      suspension: "Pull-rod front / Push-rod rear",
      brakes: "Brembo carbon-carbon",
      tyreSupplier: "Pirelli",
      weight: "798kg minimum",
      wheelbase: "3600mm",
    },
    technology: {
      drsSystem: "Active rear wing",
      ersSystem: "Ferrari Hybrid Energy Recovery",
      mgukPower: "120kW",
      fuelSystem: "Shell V-Power / Direct injection",
      coolingSystem: "Proprietary radiators",
    },
    disclosed: {
      notes: ["New sidepod geometry for 2025", "Internal combustion efficiency improved"],
    },
  },
  red_bull: {
    id: "red_bull",
    name: "Oracle Red Bull Racing",
    shortName: "Red Bull",
    primaryColor: "#001A30",
    accentColor: "#FCD700",
    modelPath: "/models/red_bull.glb",
    car: {
      chassis: "Red Bull Racing carbon composite monocoque",
      engine: "Honda RBPTH003",
      engineSupplier: "Honda RBPT",
      gearbox: "8-speed sequential",
      suspension: "Pull-rod front / Push-rod rear (highly optimized)",
      brakes: "Carbon-carbon discs",
      tyreSupplier: "Pirelli",
      weight: "798kg minimum",
      wheelbase: "3600mm",
    },
    technology: {
      drsSystem: "Hydraulic dual-element wing",
      ersSystem: "Integrated MGU-H/K",
      mgukPower: "120kW",
      fuelSystem: "ExxonMobil",
      coolingSystem: "Advanced vertical inlets",
    },
    disclosed: {
      notes: ["Evolution of RB20 floor design", "Proprietary front wing flexibility"],
    },
  },
  mercedes: {
    id: "mercedes",
    name: "Mercedes-AMG PETRONAS F1 Team",
    shortName: "Mercedes",
    primaryColor: "#27F4D2",
    accentColor: "#000000",
    modelPath: "/models/mercedes.glb",
    car: {
      chassis: "Mercedes carbon composite",
      engine: "Mercedes-AMG F1 M16 E Performance",
      engineSupplier: "Mercedes",
      gearbox: "Mercedes-AMG 8-speed",
      suspension: "Push-rod front / Push-rod rear",
      brakes: "Carbone Industrie",
      tyreSupplier: "Pirelli",
      weight: "798kg minimum",
      wheelbase: "3600mm",
    },
    technology: {
      drsSystem: "Low-drag rear assembly",
      ersSystem: "High-density battery pack",
      mgukPower: "120kW",
      fuelSystem: "Petronas Primax",
      coolingSystem: "Zero-pod evolution",
    },
    disclosed: {
      notes: ["Completely revised rear suspension for 2025", "New silver livery with emerald accents"],
    },
  },
  mclaren: {
    id: "mclaren",
    name: "McLaren Formula 1 Team",
    shortName: "McLaren",
    primaryColor: "#FF8000",
    accentColor: "#5FB3FF",
    modelPath: "/models/mclaren.glb",
    car: {
      chassis: "McLaren carbon fibre monocoque",
      engine: "Mercedes-AMG F1 M16 E Performance",
      engineSupplier: "Mercedes",
      gearbox: "McLaren 8-speed",
      suspension: "Pull-rod front / Push-rod rear",
      brakes: "Akebono",
      tyreSupplier: "Pirelli",
      weight: "798kg minimum",
      wheelbase: "3600mm",
    },
    technology: {
      drsSystem: "Efficient aero-flap",
      ersSystem: "Mercedes standard ERS",
      mgukPower: "120kW",
      fuelSystem: "Petronas",
      coolingSystem: "High-efficiency side-mounts",
    },
    disclosed: {
      notes: ["Focus on high-speed cornering stability", "Papaya and chrome livery"],
    },
  },
  alpine: {
    id: "alpine",
    name: "BWT Alpine F1 Team",
    shortName: "Alpine",
    primaryColor: "#0090FF",
    accentColor: "#FF70D4",
    modelPath: "/models/alpine.glb",
    car: {
      chassis: "Alpine carbon fibre",
      engine: "Renault E-Tech RE25",
      engineSupplier: "Renault",
      gearbox: "Alpine 8-speed",
      suspension: "Push-rod front / Push-rod rear",
      brakes: "Brembo",
      tyreSupplier: "Pirelli",
      weight: "798kg minimum",
      wheelbase: "3600mm",
    },
    technology: {
      drsSystem: "Standard FIA spec",
      ersSystem: "Renault hybrid system",
      mgukPower: "120kW",
      fuelSystem: "BP Ultimate",
      coolingSystem: "Split-cooling layout",
    },
    disclosed: {
      notes: ["Weight reduction focused chassis", "Pink and Blue livery"],
    },
  },
  aston_martin: {
    id: "aston_martin",
    name: "Aston Martin Aramco F1 Team",
    shortName: "Aston Martin",
    primaryColor: "#006F62",
    accentColor: "#CEDC00",
    modelPath: "/models/aston_martin.glb",
    car: {
      chassis: "Aston Martin carbon composite",
      engine: "Mercedes-AMG F1 M16 E Performance",
      engineSupplier: "Mercedes",
      gearbox: "Mercedes 8-speed",
      suspension: "Push-rod front / Push-rod rear",
      brakes: "Brembo",
      tyreSupplier: "Pirelli",
      weight: "798kg minimum",
      wheelbase: "3600mm",
    },
    technology: {
      drsSystem: "Aggressive wing profiles",
      ersSystem: "Mercedes hybrid",
      mgukPower: "120kW",
      fuelSystem: "Aramco",
      coolingSystem: "Large inlet geometry",
    },
    disclosed: {
      notes: ["New wind tunnel development influence", "British Racing Green"],
    },
  },
  williams: {
    id: "williams",
    name: "Williams Racing",
    shortName: "Williams",
    primaryColor: "#005AFF",
    accentColor: "#002D64",
    modelPath: "/models/williams.glb",
    car: {
      chassis: "Williams carbon composite",
      engine: "Mercedes-AMG F1 M16 E Performance",
      engineSupplier: "Mercedes",
      gearbox: "Williams 8-speed",
      suspension: "Push-rod front / Push-rod rear",
      brakes: "AP Racing",
      tyreSupplier: "Pirelli",
      weight: "798kg minimum",
      wheelbase: "3600mm",
    },
    technology: {
      drsSystem: "Standard aero",
      ersSystem: "Mercedes hybrid",
      mgukPower: "120kW",
      fuelSystem: "Gulf",
      coolingSystem: "Slimline cooling",
    },
    disclosed: {
      notes: ["Focused on straight-line efficiency", "Deep blue and heritage livery"],
    },
  },
  haas: {
    id: "haas",
    name: "MoneyGram Haas F1 Team",
    shortName: "Haas",
    primaryColor: "#EE1D23",
    accentColor: "#000000",
    modelPath: "/models/haas.glb",
    car: {
      chassis: "Dallara carbon fibre",
      engine: "Ferrari 066/12",
      engineSupplier: "Ferrari",
      gearbox: "Ferrari 8-speed",
      suspension: "Push-rod front / Push-rod rear",
      brakes: "Brembo",
      tyreSupplier: "Pirelli",
      weight: "798kg minimum",
      wheelbase: "3600mm",
    },
    technology: {
      drsSystem: "Ferrari-influenced wing",
      ersSystem: "Ferrari hybrid",
      mgukPower: "120kW",
      fuelSystem: "Shell",
      coolingSystem: "Ferrari-style inlets",
    },
    disclosed: {
      notes: ["Revised floor aerodynamics", "White, red and black livery"],
    },
  },
  sauber: {
    id: "sauber",
    name: "Stake F1 Team Kick Sauber",
    shortName: "Kick Sauber",
    primaryColor: "#52E252",
    accentColor: "#000000",
    modelPath: "/models/sauber.glb",
    car: {
      chassis: "Sauber carbon composite",
      engine: "Ferrari 066/12",
      engineSupplier: "Ferrari",
      gearbox: "Sauber 8-speed",
      suspension: "Push-rod front / Push-rod rear",
      brakes: "Brembo",
      tyreSupplier: "Pirelli",
      weight: "798kg minimum",
      wheelbase: "3600mm",
    },
    technology: {
      drsSystem: "Low-drag assembly",
      ersSystem: "Ferrari hybrid",
      mgukPower: "120kW",
      fuelSystem: "Shell",
      coolingSystem: "Proprietary design",
    },
    disclosed: {
      notes: ["Transition year for Audi entry", "Neon green and black"],
    },
  },
  racing_bulls: {
    id: "racing_bulls",
    name: "Visa Cash App RB F1 Team",
    shortName: "Racing Bulls",
    primaryColor: "#6692FF",
    accentColor: "#FFFFFF",
    modelPath: "/models/racing_bulls.glb",
    car: {
      chassis: "RB carbon composite",
      engine: "Honda RBPTH003",
      engineSupplier: "Honda RBPT",
      gearbox: "Red Bull Technology 8-speed",
      suspension: "Pull-rod front / Push-rod rear",
      brakes: "Brembo",
      tyreSupplier: "Pirelli",
      weight: "798kg minimum",
      wheelbase: "3600mm",
    },
    technology: {
      drsSystem: "Standard aero",
      ersSystem: "Honda hybrid",
      mgukPower: "120kW",
      fuelSystem: "Mobil 1",
      coolingSystem: "RB influenced design",
    },
    disclosed: {
      notes: ["Close technical ties with Red Bull Racing", "Blue, white and silver livery"],
    },
  },
};
