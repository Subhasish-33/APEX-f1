export interface Driver {
  driver_id: number;
  driver_ref: string;
  code?: string;
  forename: string;
  surname: string;
  nationality: string;
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
}

export interface Race {
  race_id: number;
  year: number;
  round: number;
  circuit_id: string;
  name: string;
  date: string;
}

export interface Result {
  result_id: number;
  race_id: number;
  driver_id: number;
  constructor_id: number;
  grid: number;
  position?: number;
  points: number;
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
