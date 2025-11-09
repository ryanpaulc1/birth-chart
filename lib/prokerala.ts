import type { ProkeralaAuthResponse, ProkeralaNatalChartResponse } from "./types";

const PROKERALA_BASE_URL = "https://api.prokerala.com";
const TOKEN_URL = `${PROKERALA_BASE_URL}/token`;
const API_BASE_URL = `${PROKERALA_BASE_URL}/v2`;

// In-memory token cache (for serverless, you might want to use Redis or similar)
let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Get OAuth access token from ProKerala API
 * Caches the token until it expires (1 hour)
 */
export async function getAccessToken(): Promise<string> {
  // Check if we have a valid cached token
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  const clientId = process.env.PROKERALA_CLIENT_ID;
  const clientSecret = process.env.PROKERALA_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("ProKerala API credentials not configured");
  }

  // Request new token using Client Credentials flow
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get ProKerala access token: ${error}`);
  }

  const data: ProkeralaAuthResponse = await response.json();

  // Cache the token (subtract 5 minutes from expiry for safety)
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 300) * 1000,
  };

  return data.access_token;
}

/**
 * Fetch birth details (sun sign, moon sign, nakshatra) from ProKerala API
 * This endpoint returns JSON data instead of SVG
 */
export async function getNatalChart(params: {
  datetime: string; // ISO 8601 format with timezone
  coordinates: string; // "latitude,longitude"
}): Promise<any> {
  const token = await getAccessToken();

  // Birth-details endpoint uses direct parameters (no profile nesting)
  const queryParams = new URLSearchParams({
    ayanamsa: "1", // Lahiri
    datetime: params.datetime,
    coordinates: params.coordinates,
  });

  const response = await fetch(
    `${API_BASE_URL}/astrology/birth-details?${queryParams}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(`Failed to fetch birth details (${response.status}): ${responseText}`);
  }

  // Try to parse as JSON
  try {
    return JSON.parse(responseText);
  } catch (e) {
    throw new Error(`Invalid response format: ${responseText.substring(0, 200)}`);
  }
}

/**
 * Fetch kundli (horoscope) with planetary positions
 */
export async function getKundli(params: {
  datetime: string;
  coordinates: string;
}): Promise<any> {
  const token = await getAccessToken();

  const queryParams = new URLSearchParams({
    ayanamsa: "1",
    datetime: params.datetime,
    coordinates: params.coordinates,
    chart_type: "rasi", // D1 chart
  });

  const response = await fetch(
    `${API_BASE_URL}/astrology/kundli?${queryParams}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(`Failed to fetch kundli (${response.status}): ${responseText}`);
  }

  try {
    return JSON.parse(responseText);
  } catch (e) {
    throw new Error(`Invalid kundli response: ${responseText.substring(0, 200)}`);
  }
}

/**
 * Helper to convert birth details to ProKerala format
 */
export function formatBirthDateTime(
  date: string, // YYYY-MM-DD
  time: string, // HH:MM
  timezone: string // e.g., "America/New_York"
): string {
  // Combine date and time
  const datetime = new Date(`${date}T${time}`);

  // Format to ISO 8601 with timezone
  // ProKerala expects: 2004-02-12T15:19:21+00:00
  const isoString = datetime.toISOString();

  // For now, we'll use UTC. In a real app, you'd calculate the proper offset
  // based on the timezone parameter
  return isoString.replace('Z', '+00:00');
}

/**
 * Fetch planet positions with degrees
 */
export async function getPlanetPositions(params: {
  datetime: string;
  coordinates: string;
}): Promise<any> {
  const token = await getAccessToken();

  const queryParams = new URLSearchParams({
    ayanamsa: "1",
    datetime: params.datetime,
    coordinates: params.coordinates,
  });

  const response = await fetch(
    `${API_BASE_URL}/astrology/planet-position?${queryParams}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(`Failed to fetch planet positions (${response.status}): ${responseText}`);
  }

  try {
    return JSON.parse(responseText);
  } catch (e) {
    throw new Error(`Invalid planet position response: ${responseText.substring(0, 200)}`);
  }
}

/**
 * Format coordinates for ProKerala API
 */
export function formatCoordinates(latitude: number, longitude: number): string {
  return `${latitude},${longitude}`;
}
