export interface Driver {
  driver_id: number;
  driver_ref: string;
  code?: string;
  forename: string;
  surname: string;
  nationality: string;
  number?: number;
}

export interface Constructor {
  constructor_id: number;
  constructor_ref: string;
  name: string;
  nationality: string;
}

export interface Circuit {
  circuit_id: string;
  name: string;
  location: string;
  country: string;
  overtaking_difficulty?: number;
  downforce_level?: string;
  tire_degradation?: string;
  weather_volatility?: number;
  safety_car_probability?: number;
  top_speed_level?: string;
  atmosphere_description?: string;
}

export interface Race {
  race_id: number;
  year: number;
  round: number;
  circuit_id: string;
  name: string;
  date: string;
  laps?: number;
  fp1_date?: string;
  fp2_date?: string;
  fp3_date?: string;
  qualifying_date?: string;
  sprint_date?: string;
  analytics?: {
    overtaking_index?: number;
    chaos_prob?: number;
    championship_significance?: number;
    [key: string]: any;
  };
  circuit?: Circuit;
}

export interface Result {
  result_id: number;
  race_id: number;
  driver_id: number;
  constructor_id: number;
  grid: number;
  position?: number;
  points: number;
  time?: string;
  milliseconds?: number;
  fastest_lap?: number;
  fastest_lap_time?: string;
  status?: string;
  driver?: Driver;
  constructor?: Constructor;
}

export interface DriverStanding {
  id: number;
  race_id: number;
  driver_id: number;
  points: number;
  position: number;
  driver?: Driver;
}

export interface ConstructorStanding {
  id: number;
  race_id: number;
  constructor_id: number;
  points: number;
  position: number;
  wins: number;
  constructor?: Constructor;
}

export interface Qualifying {
  id: number;
  race_id: number;
  driver_id: number;
  constructor_id: number;
  position: number;
  q1?: string;
  q2?: string;
  q3?: string;
  driver?: Driver;
  constructor?: Constructor;
}

export interface PitStop {
  id: number;
  race_id: number;
  driver_id: number;
  stop: number;
  lap: number;
  time: string;
  duration: string;
  driver?: Driver;
}

export interface RaceDetail extends Race {
  results: Result[];
  qualifying: Qualifying[];
  pit_stops: PitStop[];
}

export interface PaginatedResponse<T> {
  total_count: number;
  page: number;
  limit: number;
  data: T[];
  freshness?: string;
}

export interface ConstructorHistoryEntry {
  year: number;
  points: number;
  position: number;
  wins: number;
}

export interface Prediction {
  race_id: number;
  driver_id: number;
  probability: number;
  rank: number;
}

export interface Telemetry {
  race_id: number;
  driver_id: number;
  lap_number: number;
  sector1_time?: number;
  sector2_time?: number;
  sector3_time?: number;
  lap_time?: number;
  compound?: string;
  tire_age?: number;
  speed_trap?: number;
  weather_temp?: number;
  track_temp?: number;
  position?: number;
}

export interface Rivalry {
  driver_ids: number[];
  intensity: number;
  encounters: number;
  driver_names?: string[];
}

export interface SeasonIntelligence {
  year: number;
  dna: string;
  tension_score: number;
  volatility_index: Record<number, number>;
  pressure_map: Record<number, number>;
  rivalries: Rivalry[];
  storylines: string[];
}
