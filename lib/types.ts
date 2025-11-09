// Birth Chart Data Types
export interface BirthDetails {
  name: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  location: {
    city: string;
    latitude: number;
    longitude: number;
    timezone: string;
  };
}

export interface ZodiacSign {
  id: number;
  name: string;
  symbol: string;
  element: "Fire" | "Earth" | "Air" | "Water";
  quality: "Cardinal" | "Fixed" | "Mutable";
  rulingPlanet: string;
  dateRange: string;
}

export interface BirthChartData {
  sun: ZodiacSign;
  moon: ZodiacSign;
  rising: ZodiacSign;
  houses: HouseData[];
  planets: PlanetPosition[];
}

export interface HouseData {
  number: number;
  sign: ZodiacSign;
  degree: number;
}

export interface PlanetPosition {
  planet: string;
  sign: ZodiacSign;
  house: number;
  degree: number;
  isRetrograde: boolean;
}

// ProKerala API Types
export interface ProkeralaAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface ProkeralaNatalChartResponse {
  status: string;
  data: {
    planets: Array<{
      id: number;
      name: string;
      full_degree: number;
      norm_degree: number;
      speed: number;
      is_retrograde: boolean;
      position: number;
      rasi: number;
      rasi_lord: number;
    }>;
    houses: Array<{
      id: number;
      degree: number;
      rasi: number;
    }>;
  };
}

// Geocoding Types
export interface GeocodeResult {
  city: string;
  latitude: number;
  longitude: number;
  timezone: string;
  formattedAddress: string;
}
