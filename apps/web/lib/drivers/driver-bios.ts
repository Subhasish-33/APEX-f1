/**
 * APEX-F1 Driver Biographies
 * Curated editorial content for each driver.
 */

export interface BioSection {
  title: string;
  content: string;
}

export interface DriverBio {
  sections: BioSection[];
  motto: string;
}

export const DRIVER_BIOS: Record<string, DriverBio> = {
  verstappen: {
    motto: "Simply Lovely.",
    sections: [
      {
        title: "Early Ascent",
        content: "Born into a racing dynasty, Max's path was set before he could walk. His meteoric rise through the karting ranks was characterized by an aggressive, uncompromising style that would become his trademark."
      },
      {
        title: "F1 Breakthrough",
        content: "Entering F1 as the youngest ever driver, Max proved his skeptics wrong with a stunning debut win for Red Bull in Barcelona. It was the moment the grid realized a new era had begun."
      },
      {
        title: "The Champion's Era",
        content: "From the dramatic finale in Abu Dhabi to his record-breaking 2023 season, Max has evolved into a clinical winning machine, rewriting the F1 history books with every lap."
      }
    ]
  },
  hamilton: {
    motto: "Still We Rise.",
    sections: [
      {
        title: "The Prodigy",
        content: "From Stevenage to the world stage, Lewis's journey is one of the most inspiring in sports history. His arrival in 2007 changed the face of Formula 1 forever."
      },
      {
        title: "Dominance & Legacy",
        content: "Seven world titles, over 100 wins—the numbers speak for themselves. But beyond the track, Lewis has become a global icon, using his platform to drive change and diversity in motorsport."
      }
    ]
  },
  leclerc: {
    motto: "Monaco's Chosen Son.",
    sections: [
      {
        title: "The Ferrari Dream",
        content: "Charles is more than just a driver; he is the heartbeat of the Tifosi. His journey from the Ferrari Driver Academy to becoming the youngest ever Ferrari pole-sitter is the stuff of legend."
      },
      {
        title: "Pure Pace",
        content: "Known for his breathtaking qualifying laps and raw natural talent, Charles represents the future of Ferrari's championship ambitions."
      }
    ]
  },
  norris: {
    motto: "Leading the Charge.",
    sections: [
      {
        title: "The McLaren Rebirth",
        content: "Lando has grown from a talented rookie into one of the most formidable leaders on the grid. His role in McLaren's return to the front has been instrumental."
      },
      {
        title: "Dynamic Evolution",
        content: "A master of both race craft and technical feedback, Lando's evolution into a Grand Prix winner marks the arrival of a true title contender."
      }
    ]
  },
  alonso: {
    motto: "The Ultimate Competitor.",
    sections: [
      {
        title: "Eternal Fire",
        content: "Two world titles and over two decades at the top. Fernando's longevity and relentless pursuit of perfection make him one of the greatest to ever sit in a cockpit."
      },
      {
        title: "Tactical Mastery",
        content: "Whether it's defending like a lion or executing an impossible overtake, Fernando's race craft remains the gold standard for the entire grid."
      }
    ]
  }
};

export const getDriverBio = (ref: string | undefined): DriverBio => {
  const fallback: DriverBio = {
    motto: "Driven by Intelligence.",
    sections: [
      {
        title: "Career Journey",
        content: "A dedicated competitor in the pinnacle of motorsport, consistently pushing the limits of technology and human performance."
      }
    ]
  };

  if (!ref) return fallback;
  const normalized = ref.replace(/-/g, "_");
  return DRIVER_BIOS[normalized] || fallback;
};
